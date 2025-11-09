import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../../services/geminiService.ts';
import { audioBlobToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';

const AudioTranscriber = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const startRecording = async () => {
        setError('');
        setTranscription('');
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
            setError("Não foi possível acessar o microfone. Por favor, verifique as permissões do seu navegador.");
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                setIsRecording(false);
                setFeedbackSent(false);
                setIsLoading(true);
                try {
                    const base64 = await audioBlobToBase64(audioBlob);
                    const result = await transcribeAudio(base64, audioBlob.type);
                    setTranscription(result);
                } catch (err) {
                    setError("Falha ao transcrever o áudio.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
        }
    }, []);

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
                    <h3 className="text-2xl font-bold text-dark font-serif">Transcritor de Áudio Simples</h3>
                    <p className="text-slate-600">
                        Grave notas de voz diretamente do campo e obtenha uma transcrição de texto instantânea.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <button
                    onClick={handleToggleRecording}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-full text-white font-bold flex items-center space-x-2 transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-secondary'} disabled:bg-gray-400`}
                >
                    <span className="text-2xl">{isRecording ? '■' : '●'}</span>
                    <span>{isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}</span>
                </button>
                {isRecording && <div className="text-red-500 animate-pulse">Gravando...</div>}
            </div>

            {error && <p className="text-amber-700 mt-4 text-center">{error}</p>}

            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-40 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                        <span className="ml-4">Transcrevendo áudio...</span>
                    </div>
                )}
                {transcription && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Transcrição:</h4>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap border border-gray-200">{transcription}</div>
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
                                A transcrição automática é uma ferramenta para conveniência e pode conter imprecisões. Para documentos importantes, relatórios ou laudos, revise e valide sempre o texto gerado.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioTranscriber;
