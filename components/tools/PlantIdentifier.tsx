import React, { useState, useCallback } from 'react';
import { identifyPlant } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import { GroundingChunk } from '@google/genai';
import SpeakButton from './SpeakButton.tsx';
import GroundingSources from './GroundingSources.tsx';

const TOOL_ID = 'plant-identifier';

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

const PlantIdentifier = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analyzeDiseases, setAnalyzeDiseases] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] | undefined } | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();

    const userCanUse = canUse(TOOL_ID);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIdentify = useCallback(async () => {
        if (!imageFile) {
            setError('Por favor, carregue uma imagem para identificação.');
            return;
        }
        if (!userCanUse) {
            setError('Você não tem mais usos gratuitos ou créditos suficientes.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const base64 = await fileToBase64(imageFile);
            const analysisResult = await identifyPlant(base64, imageFile.type, analyzeDiseases);
            setResult(analysisResult);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao identificar a planta. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, userCanUse, consume, analyzeDiseases]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Identificador de Plantas</h3>
                    <p className="text-slate-600">
                        Envie a foto de uma planta (folha, flor ou inteira) para identificá-la.
                    </p>
                </div>
                <CostDisplay />
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="plant-image-upload" className="block text-sm font-medium text-slate-700 mb-2">Carregar Imagem da Planta</label>
                    <input
                        id="plant-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                    />
                </div>
                {imagePreview && (
                    <div className="flex justify-center border-2 border-dashed rounded-lg p-2">
                        <img src={imagePreview} alt="Preview da planta" className="max-h-64 rounded-lg shadow-md" />
                    </div>
                )}
                <div className="flex items-center gap-2 my-4 p-3 bg-slate-50 rounded-md border">
                    <input
                        id="analyze-diseases"
                        type="checkbox"
                        checked={analyzeDiseases}
                        onChange={(e) => setAnalyzeDiseases(e.target.checked)}
                        className="h-4 w-4 rounded text-primary focus:ring-secondary"
                    />
                    <label htmlFor="analyze-diseases" className="text-sm font-medium text-slate-700">
                        Analisar também possíveis doenças na planta?
                    </label>
                </div>
                <button
                    onClick={handleIdentify}
                    disabled={isLoading || !imageFile || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!userCanUse ? 'Sem usos gratuitos ou créditos suficientes.' : 'Identificar Planta'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Identificando...</span></> : 'Identificar Planta'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

            {!userCanUse && !isLoading && !error && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Limite Atingido!</p>
                    <p>Você já usou suas identificações gratuitas de hoje. Para continuar, você precisará de créditos.</p>
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
                             <SpeakButton textToSpeak={result.text} />
                        </div>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none">{result.text}</div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200">
                             {result.chunks && result.chunks.length > 0 && (
                                <GroundingSources chunks={result.chunks} />
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
                                A identificação de plantas e a análise de doenças por imagem são sugestões preliminares. Um diagnóstico incorreto pode ter consequências graves (ex: toxicidade). A confirmação por um engenheiro agrônomo, botânico ou fitopatologista é essencial antes de qualquer ação.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlantIdentifier;