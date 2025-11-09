import React, { useState, useRef } from 'react';
import { generateSpeech } from '../../services/geminiService.ts';
import { decode, decodeAudioData } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';

interface SpeakButtonProps {
    textToSpeak: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ textToSpeak }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleSpeak = async () => {
        if (!textToSpeak || isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            // Resume context on user gesture
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const base64Audio = await generateSpeech(textToSpeak);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();

        } catch (err) {
            console.error('Error generating or playing speech:', err);
            setError('Falha ao gerar áudio.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
                onClick={handleSpeak}
                disabled={isLoading || !textToSpeak}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-primary disabled:opacity-50 disabled:cursor-wait transition-colors"
                title={isLoading ? "Gerando áudio..." : "Ouvir resultado"}
            >
                {isLoading ? (
                    <LoadingSpinner size="sm" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 8.464a5 5 0 000 7.072m2.829-9.9a9 9 0 000 12.728M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default SpeakButton;