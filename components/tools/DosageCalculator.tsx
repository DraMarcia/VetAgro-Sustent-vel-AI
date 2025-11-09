import React, { useState, useMemo } from 'react';

type Unit = 'mg/mL' | 'mg/comprimido';

const DosageCalculator = () => {
    const [weight, setWeight] = useState('');
    const [dose, setDose] = useState('');
    const [concentration, setConcentration] = useState('');
    const [unit, setUnit] = useState<Unit>('mg/mL');
    const [error, setError] = useState('');

    const result = useMemo(() => {
        const numWeight = parseFloat(weight);
        const numDose = parseFloat(dose);
        const numConcentration = parseFloat(concentration);

        if (isNaN(numWeight) || isNaN(numDose) || isNaN(numConcentration) || numWeight <= 0 || numDose <= 0 || numConcentration <= 0) {
            return null;
        }
        setError('');
        const totalDoseMg = numWeight * numDose;
        const finalAmount = totalDoseMg / numConcentration;

        return {
            totalDoseMg: totalDoseMg.toFixed(2),
            finalAmount: finalAmount.toFixed(2),
            unitLabel: unit === 'mg/mL' ? 'mL' : 'comprimido(s)',
        };
    }, [weight, dose, concentration, unit]);

    const handleCalculateClick = () => {
        if (!weight || !dose || !concentration) {
            setError('Por favor, preencha todos os campos para calcular.');
        } else if (!result) {
            setError('Por favor, insira valores numéricos válidos e maiores que zero.');
        } else {
            setError('');
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Calculadora de Doses</h3>
                    <p className="text-slate-600">
                        Calcule a dose correta do medicamento para seu paciente.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Peso do Animal (kg)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 15.5" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dose do Fármaco (mg/kg)</label>
                        <input type="number" value={dose} onChange={e => setDose(e.target.value)} placeholder="Ex: 2.2" className="w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Concentração</label>
                         <div className="flex">
                            <input type="number" value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Ex: 50" className="w-full p-2 border-r-0 border rounded-l-md" />
                            <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="p-2 border rounded-r-md bg-slate-50">
                                <option value="mg/mL">mg/mL</option>
                                <option value="mg/comprimido">mg/comp.</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* The user can see the result update live, but this button helps trigger validation messages */}
                <button
                    onClick={handleCalculateClick}
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary transition-colors"
                >
                   Calcular / Validar
                </button>
            </div>
            
            {error && <p className="text-amber-700 mt-4 text-center">{error}</p>}
            
            {result && !error && (
                <div className="mt-6 p-6 bg-teal-50 border-t-4 border-primary rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-slate-700">Dose Calculada</h4>
                    <p className="text-4xl font-bold text-primary my-2">
                        {result.finalAmount} <span className="text-2xl">{result.unitLabel}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                        (Dose total: {result.totalDoseMg} mg)
                    </p>
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500 text-justify bg-slate-50 p-3 rounded-md">
                <p className="font-bold mb-1 text-slate-600">⚠️ Aviso de Uso Profissional:</p>
                <p>
                    Esta calculadora é uma ferramenta de apoio e não substitui o julgamento clínico. A responsabilidade pela prescrição e administração de medicamentos, incluindo a verificação da dose, concentração e via de administração, é exclusivamente do(a) Médico(a) Veterinário(a). Sempre confira os cálculos e consulte a bula do medicamento.
                </p>
            </div>
        </div>
    );
};

export default DosageCalculator;