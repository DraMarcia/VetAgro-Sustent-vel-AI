import React, { useState, useCallback } from 'react';
import { complexScenarioQuery } from '../../services/geminiService.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { GroundingChunk } from '@google/genai';
import SpeakButton from './SpeakButton.tsx';
import GroundingSources from './GroundingSources.tsx';

const TOOL_ID = 'scenario-modeler';

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


const ComplexScenarioModeler = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] | undefined } | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();

    const userCanUse = canUse(TOOL_ID);

    const handleQuery = useCallback(async () => {
        if (!prompt) {
            setError('Por favor, insira um cenário para modelagem.');
            return;
        }
        if (!userCanUse) {
            setError('Você não tem mais usos gratuitos ou créditos suficientes para esta análise.');
            return;
        }
        setFeedbackSent(false);
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const queryResult = await complexScenarioQuery(prompt);
            setResult(queryResult);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao processar o cenário. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, userCanUse, consume]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-accent">
            <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Modelador de Cenários Complexos</h3>
                 </div>
                <CostDisplay />
            </div>
            <div className="flex items-center text-sm text-amber-700 bg-amber-100 p-2 rounded-md mb-4">
                <span className="text-lg mr-2">🧠</span>
                <span>Modo de Pensamento Avançado ativado para consultas de alta complexidade.</span>
            </div>
            <p className="text-slate-600 mb-4">
                Faça perguntas que exigem raciocínio profundo e planejamento.
            </p>
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva o cenário ou problema complexo..."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none h-40"
                />
                 <div className="text-xs text-slate-500 -mt-2">
                    <span className="font-semibold">Exemplo:</span>
                    <button onClick={() => setPrompt('Elabore um plano de transição de 5 anos para uma fazenda de gado de corte de 500 hectares na Amazônia para um sistema silvipastoril regenerativo, considerando os custos iniciais, espécies de árvores nativas, manejo do gado e indicadores de sucesso ambiental e financeiro.')} className="ml-2 underline hover:text-primary">Plano de Transição Regenerativa</button>
                </div>
                <button
                    onClick={handleQuery}
                    disabled={isLoading || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!userCanUse ? 'Sem usos gratuitos ou créditos suficientes.' : 'Analisar Cenário'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Processando...</span></> : 'Analisar Cenário'}
                </button>
            </div>
            {error && <p className="text-amber-700 mt-4">{error}</p>}
            {!userCanUse && !isLoading && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Limite Atingido!</p>
                    <p>Você já usou sua análise gratuita de hoje. Para continuar, você precisará de créditos.</p>
                </div>
            )}
            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col justify-center items-center h-48 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                        <p className="mt-4 text-dark font-semibold">Análise profunda em andamento...</p>
                    </div>
                )}
                {result && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-lg">Análise do Cenário:</h4>
                             <SpeakButton textToSpeak={result.text} />
                        </div>
                        <div className="bg-light p-4 rounded-lg whitespace-pre-wrap prose max-w-none">{result.text}</div>
                        
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
                                As análises de cenários são modelos teóricos gerados por IA e baseados nas informações fornecidas. Elas não constituem aconselhamento financeiro, estratégico ou técnico. Qualquer plano ou decisão deve ser rigorosamente validado por especialistas humanos na área.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplexScenarioModeler;