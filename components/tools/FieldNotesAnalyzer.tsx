import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio, analyzeFieldNotes } from '../../services/geminiService.ts';
import { audioBlobToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import SpeakButton from './SpeakButton.tsx';

const TOOL_ID = 'field-notes-analyzer';

const CostDisplay: React.FC = () => {
    const { getUsageInfo, getCost } = useCredits();
    const usageInfo = getUsageInfo(TOOL_ID);
    const cost = getCost(TOOL_ID);

    if (usageInfo && usageInfo.hasFreeUsesLeft) {
        return (
            <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {usageInfo.limit - usageInfo.used}/{usageInfo.limit} Grátis Hoje
            </div>
        );
    }
    return (
        <div className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
            Custo: {cost} 🪙
        </div>
    );
};


const FieldNotesAnalyzer: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [transcription, setTranscription] = useState('');
    const [structuredResult, setStructuredResult] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();
    const userCanUse = canUse(TOOL_ID);

    const startRecording = async () => {
        if (!userCanUse) {
            setError('Créditos ou usos gratuitos insuficientes para iniciar uma nova análise.');
            return;
        }
        setError('');
        setTranscription('');
        setStructuredResult('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Não foi possível acessar o microfone. Verifique as permissões.");
        }
    };

    const stopRecording = useCallback(async () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Release microphone
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                setIsRecording(false);
                setFeedbackSent(false);

                try {
                    setIsLoading(true);
                    setLoadingStep('Transcrevendo áudio...');
                    const base64 = await audioBlobToBase64(audioBlob);
                    const rawTranscription = await transcribeAudio(base64, audioBlob.type);
                    setTranscription(rawTranscription);

                    setLoadingStep('Estruturando informações...');
                    const structuredAnalysis = await analyzeFieldNotes(rawTranscription);
                    setStructuredResult(structuredAnalysis);
                    
                    consume(TOOL_ID);

                } catch (err) {
                    setError("Falha ao processar as notas de campo.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                    setLoadingStep('');
                }
            };
        }
    }, [consume]);

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Analisador de Notas de Campo</h3>
                    <p className="text-slate-600">
                       Grave suas observações de campo e a IA irá transcrever e estruturá-las.
                    </p>
                </div>
                <CostDisplay />
            </div>

            <div className="flex flex-col items-center space-y-4">
                <button
                    onClick={handleToggleRecording}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-full text-white font-bold flex items-center space-x-2 transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-secondary'} disabled:bg-gray-400`}
                >
                    <span className="text-2xl">{isRecording ? '■' : '●'}</span>
                    <span>{isRecording ? 'Parar e Analisar' : 'Iniciar Gravação'}</span>
                </button>
                {isRecording && <div className="text-red-500 animate-pulse">Gravando...</div>}
                {!userCanUse && !isRecording && (
                     <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700 text-sm">
                        <p className="font-bold">Limite Atingido!</p>
                        <p>Você não tem mais usos gratuitos ou créditos suficientes.</p>
                    </div>
                )}
            </div>

            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-40 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                        <span className="ml-4">{loadingStep}</span>
                    </div>
                )}
                {(structuredResult || transcription) && !isLoading && (
                    <div>
                        <div className="border-b border-gray-200 mb-4">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <button onClick={() => setActiveTab('structured')} className={`${activeTab === 'structured' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                                    Análise Estruturada
                                </button>
                                <button onClick={() => setActiveTab('raw')} className={`${activeTab === 'raw' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                                    Transcrição Bruta
                                </button>
                            </nav>
                        </div>
                        
                        {activeTab === 'structured' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-semibold text-lg">Relatório Estruturado:</h4>
                                     <SpeakButton textToSpeak={structuredResult} />
                                </div>
                                <div className="bg-light p-4 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none">{structuredResult}</div>
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-semibold text-lg">Transcrição Completa:</h4>
                                     <SpeakButton textToSpeak={transcription} />
                                </div>
                                <div className="bg-light p-4 rounded-lg whitespace-pre-wrap">{transcription}</div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-200">
                            {!feedbackSent ? (
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-slate-600">Este resultado foi útil?</p>
                                    <button onClick={() => setFeedbackSent(true)} className="p-2 rounded-full hover:bg-teal-100 transition-colors" aria-label="Sim, foi útil">👍</button>
                                    <button onClick={() => setFeedbackSent(true)} className="p-2 rounded-full hover:bg-amber-100 transition-colors" aria-label="Não, não foi útil">👎</button>
                                </div>
                            ) : (
                                <p className="text-sm font-semibold text-primary">Obrigado pelo seu feedback!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
             <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500 text-justify bg-slate-50 p-3 rounded-md">
                <p className="font-bold mb-1 text-slate-600">⚠️ Nota de Responsabilidade:</p>
                <p>
                    A transcrição e análise são automatizadas e podem conter imprecisões. Esta ferramenta deve ser usada como um auxiliar para anotações rápidas e organização de ideias, não como um substituto para laudos ou relatórios oficiais. Sempre revise e valide as informações geradas.
                </p>
            </div>
        </div>
    );
};

export default FieldNotesAnalyzer;
