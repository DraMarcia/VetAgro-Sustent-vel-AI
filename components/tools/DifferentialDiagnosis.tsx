import React, { useState, useCallback } from 'react';
import { getDifferentialDiagnosis } from '../../services/geminiService.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { GroundingChunk } from '@google/genai';
import SpeakButton from './SpeakButton.tsx';
import GroundingSources from './GroundingSources.tsx';

const TOOL_ID = 'diff-diagnosis';

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


const DifferentialDiagnosis = () => {
    const [species, setSpecies] = useState('');
    const [age, setAge] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] | undefined } | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();

    const userCanUse = canUse(TOOL_ID);

    const handleAnalyze = useCallback(async () => {
        if (!species || !symptoms) {
            setError('Por favor, preencha a espécie e os sintomas observados.');
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
            const analysisResult = await getDifferentialDiagnosis(species, age, symptoms);
            setResult(analysisResult);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao processar a análise. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [species, age, symptoms, userCanUse, consume]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Diagnóstico Diferencial Simplificado</h3>
                    <p className="text-slate-600">
                        Descreva os sintomas de um animal para receber uma lista de possíveis diagnósticos diferenciais como suporte informativo.
                    </p>
                </div>
                 <CostDisplay />
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Espécie do Animal *</label>
                        <input
                            type="text"
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            placeholder="Ex: Bovino, Equino, Canino"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Idade / Fase</label>
                        <input
                            type="text"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Ex: Bezerro, 2 anos, Idoso"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sintomas Observados *</label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Descreva detalhadamente os sinais clínicos..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none h-32"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold">Exemplo:</span>
                        <button onClick={() => {
                            setSpecies('Bovino');
                            setAge('Vaca leiteira, 4 anos');
                            setSymptoms('Apatia, perda de peso progressiva, febre intermitente (39.5°C), tosse seca e dificuldade respiratória, especialmente após esforço. Redução na produção de leite nos últimos 10 dias.');
                        }} className="ml-2 underline hover:text-primary">Preencher com caso de bovino leiteiro</button>
                    </div>
                </div>
                
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title={!userCanUse ? 'Sem usos gratuitos ou créditos suficientes.' : 'Analisar Sintomas'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Analisando...</span></> : 'Analisar Sintomas'}
                </button>
            </div>
            {error && <p className="text-amber-700 mt-4">{error}</p>}
             {!userCanUse && !isLoading && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Limite Atingido!</p>
                    <p>Você já usou suas análises gratuitas de hoje. Para continuar, você precisará de créditos.</p>
                </div>
            )}
            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col justify-center items-center h-48 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                        <p className="mt-4 text-dark font-semibold">Processando análise clínica...</p>
                    </div>
                )}
                {result && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Análise Preliminar:</h4>
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
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500 text-justify bg-slate-50 p-3 rounded-md">
                <p className="font-bold mb-1 text-slate-600">⚠️ Nota de Responsabilidade Ética e Legal:</p>
                <p>
                    Esta ferramenta de IA é um recurso de suporte informacional e educacional, projetada para auxiliar no raciocínio clínico. As informações aqui apresentadas não constituem um diagnóstico veterinário e não substituem, em hipótese alguma, a avaliação profissional, o exame físico e a anamnese completa de um animal. Conforme as normas vigentes e a ética profissional, a responsabilidade final por qualquer diagnóstico e plano de tratamento é exclusiva do(a) médico(a) veterinário(a) usuário(a).
                </p>
            </div>
        </div>
    );
};

export default DifferentialDiagnosis;