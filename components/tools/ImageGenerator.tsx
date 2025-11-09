import React, { useState, useCallback } from 'react';
import { generateImage } from '../../services/geminiService.ts';
import { ImageAspectRatio } from '../../types.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import { fileToBase64 } from '../../utils/helpers.ts';

const aspectRatios: { value: ImageAspectRatio; label: string }[] = [
    { value: '1:1', label: 'Quadrado (1:1)' },
    { value: '16:9', label: 'Paisagem (16:9)' },
    { value: '9:16', label: 'Retrato (9:16)' },
    { value: '4:3', label: 'Padrão (4:3)' },
    { value: '3:4', label: 'Vertical (3:4)' },
];

const TOOL_ID = 'image-gen';

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('16:9');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse, getCost } = useCredits();
    
    const cost = getCost(TOOL_ID);
    const userCanUse = canUse(TOOL_ID);

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
        if (!prompt) {
            setError('Por favor, insira um prompt para gerar a imagem.');
            return;
        }
        if (!userCanUse) {
            setError(`Créditos insuficientes. Esta ação custa ${cost} créditos.`);
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setImageUrl('');
        try {
            let refImgData;
            if (referenceImage) {
                const base64 = await fileToBase64(referenceImage);
                refImgData = { base64, mimeType: referenceImage.type };
            }
            const url = await generateImage(prompt, aspectRatio, refImgData);
            setImageUrl(url);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao gerar a imagem. Verifique sua conexão e tente novamente. Se o erro persistir, o serviço pode estar temporariamente indisponível.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, userCanUse, cost, consume, referenceImage]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Gerador de Imagens Conceituais</h3>
                    <p className="text-slate-600">
                        Visualize conceitos de agropecuária sustentável, com ou sem imagem de referência.
                    </p>
                </div>
                <div className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Custo: {cost} 🪙
                </div>
            </div>

            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1. Descreva a imagem</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva a imagem que você quer criar... Se usar uma imagem de referência, explique como usá-la."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={3}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold">Exemplos:</span>
                        <button onClick={() => setPrompt('Um sistema silvipastoril na Amazônia com gado Nelore e castanheiras, em estilo de pintura a óleo.')} className="ml-2 underline hover:text-primary">Sistema Silvipastoril</button>
                        <button onClick={() => setPrompt('Infográfico sobre a redução de metano entérico em bovinos, com ícones e gráficos, fundo branco.')} className="ml-2 underline hover:text-primary">Infográfico</button>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">2. Imagem de Referência (Opcional)</label>
                     {referenceImagePreview ? (
                        <div className="relative w-48 h-48 border-2 border-dashed p-1 rounded-lg">
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">3. Proporção da Imagem</label>
                    <div className="flex flex-wrap gap-2">
                        {aspectRatios.map(ratio => (
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
                    disabled={isLoading || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!userCanUse ? `Créditos insuficientes. Custo: ${cost}` : 'Gerar Imagem'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Gerando...</span></> : 'Gerar Imagem'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

            {!userCanUse && !isLoading && !error && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Créditos insuficientes!</p>
                    <p>Você não tem créditos suficientes para realizar esta ação. Por favor, adquira mais créditos para continuar.</p>
                </div>
            )}
            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-64 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
                {imageUrl && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Imagem Gerada:</h4>
                        <img src={imageUrl} alt={prompt} className="rounded-lg shadow-md w-full" />
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
        </div>
    );
};

export default ImageGenerator;