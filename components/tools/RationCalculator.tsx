
import React, { useState, useCallback } from 'react';
import { calculateRation } from '../../services/geminiService.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { useCredits } from '../../contexts/CreditContext.tsx';
import { ErrorAlert } from '../ErrorAlert.tsx';
import { RationParameters } from '../../types.ts';
import { GroundingChunk } from '@google/genai';
import SpeakButton from './SpeakButton.tsx';
import GroundingSources from './GroundingSources.tsx';

const TOOL_ID = 'ration-calculator';

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

const RationCalculator = () => {
    const [animalInfo, setAnimalInfo] = useState<RationParameters>({
        species: '',
        age: '',
        weight: '',
        goal: 'maintenance',
        ingredients: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ text: string, chunks: GroundingChunk[] | undefined } | null>(null);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const { consume, canUse } = useCredits();

    const userCanUse = canUse(TOOL_ID);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAnimalInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = useCallback(async () => {
        if (!animalInfo.species || !animalInfo.weight || !animalInfo.goal || !animalInfo.ingredients) {
            setError('Por favor, preencha todos os campos obrigatórios (*).');
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
            const calculationResult = await calculateRation(animalInfo);
            setResult(calculationResult);
            consume(TOOL_ID);
        } catch (err) {
            setError('Falha ao calcular a ração. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [animalInfo, userCanUse, consume]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Calculadora de Ração (Experimental)</h3>
                    <p className="text-slate-600">
                        Formule uma ração balanceada com base nas necessidades do animal e nos ingredientes disponíveis.
                    </p>
                </div>
                <CostDisplay />
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Espécie *</label>
                        <input name="species" value={animalInfo.species} onChange={handleInputChange} placeholder="Ex: Bovino de corte" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Idade / Fase</label>
                        <input name="age" value={animalInfo.age} onChange={handleInputChange} placeholder="Ex: Bezerro, Terminação" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg) *</label>
                        <input name="weight" type="number" value={animalInfo.weight} onChange={handleInputChange} placeholder="Ex: 450" className="w-full p-2 border rounded-md" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo da Dieta *</label>
                    <select name="goal" value={animalInfo.goal} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                        <option value="maintenance">Manutenção</option>
                        <option value="growth">Crescimento / Ganho de Peso</option>
                        <option value="lactation">Lactação</option>
                        <option value="reproduction">Reprodução</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ingredientes Disponíveis *</label>
                    <textarea
                        name="ingredients"
                        value={animalInfo.ingredients}
                        onChange={handleInputChange}
                        placeholder="Liste os ingredientes separados por vírgula. Ex: Milho moído, farelo de soja, feno de tifton, sal mineral"
                        className="w-full p-2 border rounded-md h-24"
                    />
                     <div className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold">Exemplo:</span>
                        <button onClick={() => setAnimalInfo({
                            species: 'Bovino de Corte (Nelore)',
                            age: 'Terminação',
                            weight: '450',
                            goal: 'growth',
                            ingredients: 'Milho moído, farelo de soja, silagem de milho, núcleo mineral para terminação',
                        })} className="ml-2 underline hover:text-primary">
                            Preencher com caso de bovino de corte
                        </button>
                    </div>
                </div>
                 <button
                    onClick={handleCalculate}
                    disabled={isLoading || !userCanUse}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    title={!userCanUse ? 'Sem usos gratuitos ou créditos suficientes.' : 'Calcular Ração'}
                >
                    {isLoading ? <><LoadingSpinner size="sm" /> <span className="ml-2">Calculando...</span></> : 'Calcular Ração'}
                </button>
            </div>
            
            {error && <ErrorAlert title="Erro de Validação" message={error} onDismiss={() => setError('')} />}
            
            {!userCanUse && !isLoading && !error && (
                 <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                    <p className="font-bold">Limite Atingido!</p>
                    <p>Você já usou seus cálculos gratuitos de hoje. Para continuar, você precisará de créditos.</p>
                </div>
            )}

            <div className="mt-6">
                {isLoading && (
                    <div className="flex flex-col justify-center items-center h-48 bg-slate-100 rounded-lg">
                        <LoadingSpinner />
                        <p className="mt-4 text-dark font-semibold">Realizando cálculos nutricionais...</p>
                    </div>
                )}
                {result && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Sugestão de Ração:</h4>
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
                <p className="font-bold mb-1 text-slate-600">⚠️ Nota de Responsabilidade:</p>
                <p>
                    Esta ferramenta de IA fornece uma formulação teórica com base nos dados inseridos. Ela não substitui a análise bromatológica dos ingredientes nem a avaliação de um(a) médico(a) veterinário(a) ou zootecnista. Os resultados devem ser usados como um ponto de partida e adaptados à realidade específica de cada propriedade e animal. A responsabilidade final pela formulação e fornecimento da dieta é do profissional responsável.
                </p>
            </div>
        </div>
    );
};

export default RationCalculator;