import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo, extendVideo } from '../../services/geminiService.ts';
import { VideoAspectRatio } from '../../types.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { ApiKeySelector } from '../ApiKeySelector.tsx';
import { VideosOperation } from '@google/genai';
import { ErrorAlert } from '../ErrorAlert.tsx';
import { fileToBase64 } from '../../utils/helpers.ts';

const videoAspectRatios: { value: VideoAspectRatio; label: string }[] = [
    { value: '16:9', label: 'Paisagem (16:9)' },
    { value: '9:16', label: 'Retrato (9:16)' },
];

const VideoGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [lastVideoOperation, setLastVideoOperation] = useState<VideosOperation | null>(null);
    const [extensionPrompt, setExtensionPrompt] = useState('');
    const [isExtending, setIsExtending] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [keyState, setKeyState] = useState<'checking' | 'needed' | 'ready'>('checking');
    
    const checkApiKey = useCallback(async () => {
        if (typeof window.aistudio?.hasSelectedApiKey !== 'function') {
            console.warn('AI Studio context not found, assuming key is available.');
            setKeyState('ready');
            return;
        }
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setKeyState(hasKey ? 'ready' : 'needed');
        } catch (e) {
            console.error("Error checking API key:", e);
            setKeyState('needed');
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeReferenceImage = () => {
        setReferenceImage(null);
        setReferenceImagePreview(null);
    }

    const handleGenerate = useCallback(async () => {
        if (!prompt && !referenceImage) {
            setError('Por favor, insira um prompt ou uma imagem de referência para gerar o vídeo.');
            return;
        }
        
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setVideoUrl('');
        setLastVideoOperation(null);
        try {
            let refImgData;
            if (referenceImage) {
                const base64 = await fileToBase64(referenceImage);
                refImgData = { base64, mimeType: referenceImage.type };
            }
            const { videoUrl: url, operation } = await generateVideo(prompt, aspectRatio, refImgData);
            setVideoUrl(url);
            setLastVideoOperation(operation);
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found") || err.message?.includes("API key not valid")) {
                console.error("Authentication error, resetting API key selection flow.");
                setError('Sua Chave de API parece inválida ou não está vinculada a um projeto com faturamento ativo. Por favor, selecione uma chave válida para continuar.');
                setKeyState('needed');
                return;
            }
            let errorMessage = `Falha ao gerar o vídeo. Detalhes: ${err.message || 'Erro desconhecido.'}`;
            if (err.message && (err.message.includes('"code":429') || err.message.toUpperCase().includes('RESOURCE_EXHAUSTED'))) {
                errorMessage = 'Limite de uso da API atingido (Erro 429). Você excedeu sua cota de geração de vídeos para esta chave. Por favor, aguarde o reset da sua cota (geralmente diário) ou verifique seu plano e faturamento no Google AI Studio.';
            }
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, referenceImage]);
    
    const handleExtend = useCallback(async () => {
        if (!extensionPrompt || !lastVideoOperation) {
            setError('Por favor, insira um prompt para estender o vídeo.');
            return;
        }

        setFeedbackSent(false);
        setIsExtending(true);
        setError('');
        try {
            const { videoUrl: newUrl, operation: newOperation } = await extendVideo(lastVideoOperation, extensionPrompt);
            setVideoUrl(newUrl);
            setLastVideoOperation(newOperation);
            setExtensionPrompt('');
        } catch (err: any) {
             let errorMessage = `Falha ao estender o vídeo. Detalhes: ${err.message || 'Erro desconhecido.'}`;
            if (err.message && (err.message.includes('"code":429') || err.message.toUpperCase().includes('RESOURCE_EXHAUSTED'))) {
                errorMessage = 'Limite de uso da API atingido (Erro 429). Você excedeu sua cota de extensões de vídeo para esta chave. Por favor, aguarde o reset da sua cota ou verifique seu plano e faturamento no Google AI Studio.';
            }
             setError(errorMessage);
             console.error(err);
        } finally {
            setIsExtending(false);
        }
    }, [extensionPrompt, lastVideoOperation]);

    const renderContent = () => {
        if (keyState === 'checking') {
            return (
                <div className="flex justify-center items-center h-48">
                    <LoadingSpinner />
                </div>
            );
        }

        if (keyState === 'needed') {
            return (
                 <ApiKeySelector 
                    onKeySelected={() => {
                        setKeyState('ready');
                        setError(''); 
                    }} 
                />
            );
        }
        
        return (
             <div className="space-y-4 mt-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva o vídeo que você quer criar..."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={3}
                />
                <div className="text-xs text-slate-500 -mt-2">
                    <span className="font-semibold">Exemplos:</span>
                    <button onClick={() => setPrompt('Animação 3D mostrando o ciclo do carbono em um sistema de pastagem bem manejado.')} className="ml-2 underline hover:text-primary">Ciclo do Carbono</button>
                    <button onClick={() => setPrompt('Um vídeo curto e realista de um drone sobrevoando um rebanho de gado em um sistema de integração lavoura-pecuária-floresta (ILPF).')} className="ml-2 underline hover:text-primary">Drone em ILPF</button>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Imagem de Referência (Opcional)</label>
                     {referenceImagePreview ? (
                        <div className="relative w-48 h-27 border-2 border-dashed p-1 rounded-lg">
                             <img src={referenceImagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                             <button onClick={removeReferenceImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm">&times;</button>
                        </div>
                     ) : (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleReferenceImageChange}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                        />
                     )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Proporção do Vídeo</label>
                    <div className="flex flex-wrap gap-2">
                        {videoAspectRatios.map(ratio => (
                            <button
                                key={ratio.value}
                                onClick={() => setAspectRatio(ratio.value)}
                                className={`px-4 py-2 text-sm rounded-full border-2 ${aspectRatio === ratio.value ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-gray-300 hover:border-secondary'}`}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || isExtending}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Gerando Vídeo (pode levar alguns minutos)...</span></> : 'Gerar Vídeo'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Gerador de Vídeos Curtos</h3>
                    <p className="text-slate-600">
                        Crie pequenos vídeos explicativos sobre temas complexos (Tecnologia Veo).
                    </p>
                </div>
            </div>
            
            <div className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg flex items-start gap-3 mb-4">
                <span className="text-lg mt-0.5" aria-hidden="true">ⓘ</span>
                <div>
                    <strong>Requisito:</strong> Para usar esta ferramenta, é necessário selecionar uma Chave de API de um projeto Google Cloud com o <strong>faturamento ativado</strong>.
                </div>
            </div>

            {renderContent()}
            
            {error && <ErrorAlert title="Atenção" message={error} onDismiss={() => setError('')} />}

            <div className="mt-6">
                {(isLoading || isExtending) && (
                    <div className="flex flex-col justify-center items-center h-64 bg-slate-100 rounded-lg p-4 text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-dark font-semibold">{isExtending ? 'Estendendo seu vídeo...' : 'Gerando seu vídeo...'}</p>
                        <p className="text-slate-600 text-sm">Este processo pode demorar alguns minutos. Fique à vontade para navegar em outras abas.</p>
                    </div>
                )}
                {videoUrl && !isLoading && !isExtending && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Vídeo Gerado:</h4>
                        <video key={videoUrl} controls autoPlay muted loop className="rounded-lg shadow-md w-full" >
                           <source src={videoUrl} type="video/mp4" />
                        </video>

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
                        
                        {lastVideoOperation && (
                             <div className="mt-6 p-4 bg-slate-50 rounded-lg border space-y-3">
                                <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="font-semibold text-lg">Estender Vídeo</h4>
                                        <p className="text-sm text-slate-600">
                                            Continue a cena a partir do último quadro. Descreva o que deve acontecer em seguida.
                                        </p>
                                    </div>
                                </div>
                                <textarea
                                    value={extensionPrompt}
                                    onChange={(e) => setExtensionPrompt(e.target.value)}
                                    placeholder="Ex: 'e então a câmera se afasta para mostrar a floresta'..."
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                                    rows={2}
                                />
                                <button
                                    onClick={handleExtend}
                                    disabled={isExtending || isLoading}
                                    className="w-full bg-accent text-dark font-bold py-2 px-4 rounded-lg hover:bg-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {isExtending ? <><LoadingSpinner size="sm" /> <span className="ml-2">Estendendo...</span></> : 'Estender (adiciona ~7s)'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;