import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../../services/geminiService.ts';
import { fileToBase64 } from '../../utils/helpers.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import SpeakButton from './SpeakButton.tsx';

const ImageAnalyzer = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

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

    const handleAnalyze = useCallback(async () => {
        if (!imageFile || !prompt) {
            setError('Por favor, carregue uma imagem e faça uma pergunta.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const base64 = await fileToBase64(imageFile);
            const analysisResult = await analyzeImage(prompt, base64, imageFile.type);
            setResult(analysisResult);
        } catch (err) {
            setError('Falha ao analisar a imagem. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Analisador de Imagem</h3>
                    <p className="text-slate-600">
                        Envie fotos de campo, radiografias, ou ultrassonografias e faça perguntas.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 mb-2">Carregar Imagem</label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-primary hover:file:bg-teal-100"
                    />
                </div>
                {imagePreview && (
                    <div className="flex justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                    </div>
                )}
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Faça sua pergunta sobre a imagem..."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={2}
                />
                <div className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold">Exemplos:</span>
                    <button onClick={() => setPrompt('Esta pastagem apresenta sinais de degradação?')} className="ml-2 underline hover:text-primary">Pastagem</button>
                    <button onClick={() => setPrompt('Qual o escore de condição corporal deste animal?')} className="ml-2 underline hover:text-primary">Condição Corporal</button>
                    <button onClick={() => setPrompt('Esta radiografia torácica de um cão apresenta alguma anomalia evidente nas áreas cardíaca ou pulmonar?')} className="ml-2 underline hover:text-primary">Raio-X</button>
                    <button onClick={() => setPrompt('Descreva as estruturas visíveis nesta ultrassonografia abdominal de um felino.')} className="ml-2 underline hover:text-primary">Ultrassom</button>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !imageFile}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Analisando...</span></> : 'Analisar Imagem'}
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
                            <p className="font-bold mb-1 text-slate-600">⚠️ Nota de Responsabilidade Ética e Profissional:</p>
                            <p>
                                Esta ferramenta de IA é um recurso de <strong>suporte informacional e educacional</strong>, projetada para auxiliar no raciocínio clínico. A análise de imagem, especialmente de exames de diagnóstico como radiografias e ultrassonografias, pode ajudar a identificar padrões, mas <strong>NÃO constitui um diagnóstico veterinário</strong>.
                            </p>
                            <p className="mt-2">
                                Ela não substitui, em hipótese alguma, a interpretação, o exame físico e a anamnese completa realizados por um(a) <strong>Médico(a) Veterinário(a) qualificado(a)</strong>. Conforme as normas vigentes, a responsabilidade final por qualquer diagnóstico e plano de tratamento é <strong>exclusiva do profissional</strong>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageAnalyzer;