import React, { useState, useCallback } from 'react';
import { analyzeContent } from '../../services/geminiService.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import SpeakButton from './SpeakButton.tsx';

const ContentAnalyzer = () => {
    const [content, setContent] = useState('');
    const [task, setTask] = useState('summarize');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    const taskPrompts: { [key: string]: string } = {
        summarize: "Summarize the following text into key bullet points:",
        extract: "Extract the main conclusions and data points from this text:",
        explain: "Explain the complex concepts in this text in simpler terms, as if for a university student:",
    };

    const handleAnalyze = useCallback(async () => {
        if (!content) {
            setError('Por favor, insira um conteúdo para ser analisado.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const prompt = taskPrompts[task];
            const analysisResult = await analyzeContent(prompt, content);
            setResult(analysisResult);
        } catch (err) {
            setError('Falha ao analisar o conteúdo. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [content, task, taskPrompts]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Analisador de Conteúdo Técnico</h3>
                    <p className="text-slate-600">
                        Cole um artigo científico, relatório ou notícia para extrair insights rapidamente.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Cole o texto aqui... Ex: O resumo de um artigo científico, uma notícia completa, ou um relatório técnico."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none h-48"
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tarefa a ser realizada:</label>
                    <select
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        <option value="summarize">Resumir em pontos-chave</option>
                        <option value="extract">Extrair conclusões e dados</option>
                        <option value="explain">Explicar conceitos complexos</option>
                    </select>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Analisando...</span></> : 'Analisar Conteúdo'}
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
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-lg">Resultado:</h4>
                             <SpeakButton textToSpeak={result} />
                        </div>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap">{result}</div>
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
                               Esta ferramenta fornece resumos e extrações automatizadas. A análise pode omitir nuances ou interpretar incorretamente informações complexas. Sempre consulte o documento original e utilize o julgamento profissional para tomar decisões críticas.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentAnalyzer;