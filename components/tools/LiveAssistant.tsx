import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connectLiveSession } from '../../services/geminiService.ts';
import { LiveServerMessage, LiveSession } from "@google/genai";
import { decode, encode, decodeAudioData } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';

type SessionState = 'idle' | 'connecting' | 'active' | 'error';

interface TranscriptionTurn {
    id: number;
    userInput: string;
    modelOutput: string;
}

const LiveAssistant = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const cleanup = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        audioContextRef.current = null;
        outputAudioContextRef.current = null;
    }, []);

    const startSession = async () => {
        setSessionState('connecting');
        setCurrentInput('');
        setCurrentOutput('');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            sessionPromiseRef.current = connectLiveSession({
                onopen: () => {
                    console.log('Live session opened.');
                    setSessionState('active');
                    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    }
                    const source = audioContextRef.current.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob = {
                           data: encode(new Uint8Array(int16.buffer)),
                           mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                           session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
                    }
                    if (message.serverContent?.outputTranscription) {
                        setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscriptionHistory(prev => [...prev, { id: Date.now(), userInput: currentInput, modelOutput: currentOutput }]);
                        setCurrentInput('');
                        setCurrentOutput('');
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        }
                        const outCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                        
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                        const source = outCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outCtx.destination);
                        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }

                     if (message.serverContent?.interrupted) {
                        for (const source of audioSourcesRef.current.values()) {
                          source.stop();
                          audioSourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                     }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setSessionState('error');
                    cleanup();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Live session closed.');
                    setSessionState('idle');
                    cleanup();
                },
            });
            await sessionPromiseRef.current;

        } catch (err) {
            console.error("Error starting session:", err);
            setSessionState('error');
            cleanup();
        }
    };

    const stopSession = () => {
        sessionPromiseRef.current?.then((session) => {
            session.close();
        });
        sessionPromiseRef.current = null;
        cleanup();
        setSessionState('idle');
    };
    
     useEffect(() => {
        // Cleanup on component unmount
        return () => {
           stopSession();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-dark font-serif mb-4">Assistente de Voz (Live)</h3>
            <div className="flex flex-col items-center space-y-4">
                 <button
                    onClick={sessionState === 'active' || sessionState === 'connecting' ? stopSession : startSession}
                    className={`px-8 py-4 rounded-full text-white font-bold text-lg flex items-center justify-center transition-colors duration-300 w-48 h-20 ${
                        sessionState === 'active' ? 'bg-red-600 hover:bg-red-700' :
                        sessionState === 'connecting' ? 'bg-gray-400 cursor-wait' :
                        'bg-primary hover:bg-secondary'
                    }`}
                >
                   {sessionState === 'connecting' && <LoadingSpinner size="sm" />}
                   {sessionState === 'idle' && 'Iniciar Conversa'}
                   {sessionState === 'active' && 'Encerrar'}
                   {sessionState === 'error' && 'Tentar Novamente'}
                </button>
                <p className="text-sm text-slate-500 h-5">
                    {sessionState === 'connecting' && 'Conectando ao assistente...'}
                    {sessionState === 'active' && <span className="text-red-500 animate-pulse">Ouvindo... Fale agora.</span>}
                    {sessionState === 'error' && 'Ocorreu um erro. Verifique as permissões do microfone.'}
                    {sessionState === 'idle' && 'Clique para começar a falar.'}
                </p>
            </div>
            
            <div className="mt-6 border-t pt-4 space-y-4 h-80 overflow-y-auto bg-slate-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-lg text-dark">Transcrição da Conversa</h4>
                {transcriptionHistory.map(turn => (
                    <div key={turn.id} className="text-sm">
                        <p><strong className="text-secondary">Você:</strong> {turn.userInput}</p>
                        <p><strong className="text-primary">IA:</strong> {turn.modelOutput}</p>
                    </div>
                ))}
                 {(currentInput || currentOutput) && (
                    <div className="text-sm opacity-70">
                        <p><strong className="text-secondary">Você:</strong> {currentInput}...</p>
                        <p><strong className="text-primary">IA:</strong> {currentOutput}...</p>
                    </div>
                 )}
                 {transcriptionHistory.length === 0 && !currentInput && !currentOutput && (
                    <p className="text-sm text-slate-500 italic">A transcrição aparecerá aqui.</p>
                 )}
            </div>
        </div>
    );
};

export default LiveAssistant;
