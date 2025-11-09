import React, { useState, useCallback, useEffect } from 'react';
import { queryWithMaps } from '../../services/geminiService.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { GroundingChunk } from "@google/genai";

const MapInquiry = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] | undefined } | null>(null);
    const [location, setLocation] = useState<{ lat?: number, lon?: number }>({});
    const [locationStatus, setLocationStatus] = useState('Buscando sua localização...');
    const [feedbackSent, setFeedbackSent] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setLocationStatus('Localização obtida com sucesso.');
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('Não foi possível obter a localização. As buscas podem ser menos precisas.');
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);
    
    const handleQuery = useCallback(async () => {
        if (!prompt) {
            setError('Por favor, insira uma pergunta.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const queryResult = await queryWithMaps(prompt, location.lat, location.lon);
            setResult(queryResult);
        } catch (err) {
            setError('Falha ao realizar a consulta. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, location]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Consulta Geoespacial Inteligente</h3>
                    <p className="text-slate-600">
                        Faça perguntas sobre locais, condições ambientais ou iniciativas sustentáveis.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>
            <p className="text-sm text-slate-500 mb-4 italic">{locationStatus}</p>
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: 'Quais são os projetos de agricultura de baixo carbono perto de mim?'"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={3}
                />
                <div className="text-xs text-slate-500 -mt-2">
                    <span className="font-semibold">Exemplos:</span>
                    <button onClick={() => setPrompt('Quais são as iniciativas de pecuária sustentável no estado do Pará?')} className="ml-2 underline hover:text-primary">Iniciativas Sustentáveis</button>
                    <button onClick={() => setPrompt('Mostre-me os biomas presentes na região de Santarém, Brasil.')} className="ml-2 underline hover:text-primary">Biomas Locais</button>
                </div>
                <button
                    onClick={handleQuery}
                    disabled={isLoading}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Consultando...</span></> : 'Consultar'}
                </button>
            </div>
            {error && <p className="text-amber-700 mt-4">{error}</p>}
            
            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-40 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
                {result && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Resultado da Consulta:</h4>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap">{result.text}</div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200">
                             {result.chunks && result.chunks.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="font-semibold text-dark mb-2">Fontes e Referências</h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {result.chunks.map((chunk, index) => {
                                            const source = chunk.web || chunk.maps;
                                            if (!source || !source.uri) return null;
                                            
                                            return (
                                                <li key={index}>
                                                    <a 
                                                        href={source.uri} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-primary hover:underline break-all"
                                                        title={source.uri}
                                                    >
                                                        {source.title || new URL(source.uri).hostname}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

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
                                As informações geoespaciais são geradas com base em dados públicos e podem não refletir as condições mais recentes ou locais. Os resultados servem como um ponto de partida para pesquisa e não substituem a verificação de campo ou a consulta a fontes oficiais.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapInquiry;