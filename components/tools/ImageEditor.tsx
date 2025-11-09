import React, { useState, useCallback } from 'react';
import { editImage } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';

const ImageEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalImage(file);
            setEditedImageUrl(null); // Reset edited image on new upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = useCallback(async () => {
        if (!originalImage) {
            setError('Por favor, carregue uma imagem para editar.');
            return;
        }
        if (!prompt) {
            setError('Por favor, insira um comando de edição.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setEditedImageUrl(null);
        try {
            const base64 = await fileToBase64(originalImage);
            const refImgData = { base64, mimeType: originalImage.type };
            const url = await editImage(prompt, refImgData);
            setEditedImageUrl(url);
        } catch (err) {
            setError('Falha ao editar a imagem. Tente um comando diferente ou verifique sua conexão.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, originalImage]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Editor de Imagens com IA</h3>
                    <p className="text-slate-600">
                        Envie uma imagem e descreva a alteração que deseja fazer.
                    </p>
                </div>
                 <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1. Carregue sua imagem</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">2. Descreva a edição</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: 'Adicione um filtro retrô', 'Remova a pessoa no fundo', 'Transforme em um desenho a lápis'"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={2}
                    />
                </div>
                
                <button
                    onClick={handleEdit}
                    disabled={isLoading || !originalImage}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Editando...</span></> : 'Aplicar Edição'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Ocorreu um Erro" message={error} onDismiss={() => setError('')} />}

            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-64 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {originalImagePreview && (
                        <div className="text-center">
                            <h4 className="font-semibold mb-2">Original</h4>
                            <img src={originalImagePreview} alt="Original" className="rounded-lg shadow-md w-full object-contain max-h-96" />
                        </div>
                    )}
                    {editedImageUrl && (
                        <div className="text-center">
                             <h4 className="font-semibold mb-2">Editada</h4>
                            <img src={editedImageUrl} alt="Editada" className="rounded-lg shadow-md w-full object-contain max-h-96" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;