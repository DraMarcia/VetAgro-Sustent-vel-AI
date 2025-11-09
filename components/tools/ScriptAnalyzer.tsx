import React, { useState, useCallback } from 'react';
import { analyzeAudioScript } from '../../services/geminiService.ts';
import { audioBlobToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import SpeakButton from './SpeakButton.tsx';

const TOOL_ID = 'script-analyzer';

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

const ScriptAnalyzer = () => {
    const [prompt, setPrompt] = useState('Analise a seguinte narração de um vídeo explicativo. Avalie a clareza, o ritmo e o tom da fala. Forneça sugestões para melhorar a entrega e o engajamento do público.');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();

    const userCanUse = canUse(TOOL_ID);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!audioFile || !prompt) {
            setError('Por favor, carregue um arquivo de áudio e defina um objetivo para a análise.');
            return;
        }
        if (!userCanUse) {
            setError('Você não tem mais usos gratuitos ou créditos suficientes.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const base64 = await audioBlobToBase64(audioFile);
            const analysisResult = await analyzeAudioScript(base64, audioFile.type, prompt);
            setResult(analysisResult);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao analisar o áudio. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, audioFile, userCanUse, consume]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Analisador de Roteiro (via Áudio)</h3>
                    <p className="text-slate-600">
                        Receba feedback sobre a narração e o conteúdo do seu vídeo.
                    </p>
                </div>
                 <CostDisplay />
            </div>
            
            <div className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg flex items-start gap-3 mb-4">
                <span className="text-lg mt-0.5" aria-hidden="true">ⓘ</span>
                <div>
                    <strong>Como usar:</strong> Extraia o áudio do seu vídeo (usando uma ferramenta online) e envie o arquivo (MP3, WAV, etc.) aqui para análise.
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="audio-upload" className="block text-sm font-medium text-slate-700 mb-2">1. Carregar Arquivo de Áudio</label>
                    <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                    />
                     {audioFile && <p className="text-sm text-slate-500 mt-2">Arquivo selecionado: <span className="font-medium">{audioFile.name}</span></p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">2. Objetivo da Análise</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva o que a IA deve analisar no áudio..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={4}
                    />
                </div>
                
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !audioFile || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!userCanUse ? 'Sem usos gratuitos ou créditos suficientes.' : 'Analisar Áudio'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Analisando...</span></> : 'Analisar Áudio'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

            {!userCanUse && !isLoading && !error && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Limite Atingido!</p>
                    <p>Você já usou suas análises gratuitas de hoje. Para continuar, você precisará de créditos.</p>
                </div>
            )}
            
            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-40 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
                {result && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-lg">Resultado da Análise:</h4>
                             <SpeakButton textToSpeak={result} />
                        </div>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none">{result}</div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            {!feedbackSent ? (
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-slate-600">Esta resposta foi útil?</p>
                                    <button onClick={() => setFeedbackSent(true)} className="p-2 rounded-full hover:bg-teal-100 transition-colors" aria-label="Sim, foi útil">👍</button>
                                    <button onClick={() => setFeedbackSent(true)} className="p-2 rounded-full hover:bg-amber-100 transition-colors" aria-label="Não, não foi útil">👎</button>
                                </div>
                            ) : (
                                <p className="text-sm font-semibold text-primary">Obrigado pelo seu feedback!</p>
                            )}
                        </div>
                        <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500 text-justify bg-slate-50 p-3 rounded-md">
                            <p className="font-bold mb-1 text-slate-600">⚠️ Nota de Responsabilidade:</p>
                            <p>
                                A análise do roteiro e da narração oferece feedback com base em padrões de comunicação. As sugestões são de natureza estilística e não representam regras absolutas. Adapte as recomendações ao seu público e estilo de comunicação.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScriptAnalyzer;