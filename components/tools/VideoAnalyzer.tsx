import React, { useState, useCallback, useRef } from 'react';
import { analyzeVideo } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import SpeakButton from './SpeakButton.tsx';

const VideoAnalyzer = () => {
    const [prompt, setPrompt] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setResult('');
            setError('');
            // Create a URL for previewing the video
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!videoFile || !prompt) {
            setError('Por favor, carregue um vídeo e faça uma pergunta.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const base64 = await fileToBase64(videoFile);
            const analysisResult = await analyzeVideo(prompt, base64, videoFile.type);
            setResult(analysisResult);
        } catch (err) {
            setError('Falha ao analisar o vídeo. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, videoFile]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Analisador de Vídeos</h3>
                    <p className="text-slate-600">
                        Envie um vídeo curto e faça perguntas sobre o conteúdo.
                    </p>
                </div>
                 <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="video-upload" className="block text-sm font-medium text-slate-700 mb-2">1. Carregar Vídeo</label>
                    <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                    />
                </div>
                {videoPreview && (
                    <div className="flex justify-center bg-slate-100 rounded-lg">
                        <video ref={videoRef} src={videoPreview} controls className="max-h-72 rounded-lg" />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">2. O que analisar?</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: 'Descreva o comportamento do animal neste vídeo', 'Conte o número de animais', 'Analise a marcha deste cavalo.'"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={2}
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !videoFile}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Analisando Vídeo...</span></> : 'Analisar Vídeo'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

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
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoAnalyzer;