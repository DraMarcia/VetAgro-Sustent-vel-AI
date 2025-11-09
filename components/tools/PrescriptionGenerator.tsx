import React, { useState } from 'react';

const PrescriptionGenerator = () => {
    const [formData, setFormData] = useState({
        tutor: '',
        animal: '',
        species: '',
        address: '',
        weight: '',
        prescription: '',
    });
    const [isPreview, setIsPreview] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsPreview(true);
    };

    const handlePrint = () => {
        window.print();
    };

    if (isPreview) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-section, #print-section * {
                            visibility: visible;
                        }
                        #print-section {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 2rem;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                `}</style>
                <div id="print-section" className="max-w-2xl mx-auto p-8 border rounded-lg bg-white">
                    <header className="text-center mb-8 border-b pb-4">
                        <h2 className="text-2xl font-bold text-dark font-serif">RECEITUÁRIO VETERINÁRIO</h2>
                        <p className="text-slate-600">M.Sc Márcia Salgado - Médica Veterinária</p>
                    </header>
                    <div className="space-y-4 text-sm">
                        <p><strong>Tutor(a):</strong> {formData.tutor || 'Não informado'}</p>
                        <p><strong>Endereço:</strong> {formData.address || 'Não informado'}</p>
                        <p><strong>Paciente:</strong> {formData.animal || 'Não informado'}</p>
                        <div className="grid grid-cols-2">
                            <p><strong>Espécie:</strong> {formData.species || 'Não informado'}</p>
                            <p><strong>Peso:</strong> {formData.weight ? `${formData.weight} kg` : 'Não informado'}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h3 className="font-bold text-lg mb-2">Prescrição:</h3>
                        <div className="whitespace-pre-wrap p-4 bg-slate-50 rounded-md border min-h-[150px]">
                            {formData.prescription}
                        </div>
                    </div>
                    <footer className="text-center mt-12 text-xs text-slate-500">
                        <p>_________________________________________</p>
                        <p>Assinatura e Carimbo do Profissional</p>
                        <p className="mt-2">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    </footer>
                </div>

                <div className="text-center mt-8 space-x-4 no-print">
                    <button onClick={() => setIsPreview(false)} className="bg-slate-200 text-dark font-semibold py-2 px-6 rounded-lg hover:bg-slate-300">
                        Editar
                    </button>
                    <button onClick={handlePrint} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary">
                        Imprimir
                    </button>
                </div>
            </div>
        );
    }


    return (
        <form onSubmit={handleGenerate} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-dark font-serif">Gerador de Receituário</h3>
                    <p className="text-slate-600">
                        Preencha os campos para criar uma receita veterinária profissional.
                    </p>
                </div>
                <div className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Uso Gratuito
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="tutor" value={formData.tutor} onChange={handleChange} placeholder="Nome do Tutor" className="w-full p-2 border rounded-md" />
                    <input name="animal" value={formData.animal} onChange={handleChange} placeholder="Nome do Paciente" className="w-full p-2 border rounded-md" />
                </div>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border rounded-md" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="species" value={formData.species} onChange={handleChange} placeholder="Espécie e Raça" className="w-full p-2 border rounded-md" />
                    <input name="weight" type="text" value={formData.weight} onChange={handleChange} placeholder="Peso (kg)" className="w-full p-2 border rounded-md" />
                </div>
                <textarea
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleChange}
                    placeholder="Detalhes da prescrição (Uso oral, tópico, etc.)..."
                    className="w-full p-2 border rounded-md h-40"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary transition-colors"
                >
                    Gerar para Impressão
                </button>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500 text-justify bg-slate-50 p-3 rounded-md">
                <p className="font-bold mb-1 text-slate-600">⚠️ Aviso de Uso Profissional:</p>
                <p>
                    Esta ferramenta é um utilitário para auxiliar na criação e formatação de documentos. A emissão de receituários veterinários é um ato privativo de profissionais graduados em Medicina Veterinária, devidamente inscritos no Conselho Regional de Medicina Veterinária (CRMV) de sua jurisdição. O uso indevido desta ferramenta é de inteira responsabilidade do usuário.
                </p>
            </div>
        </form>
    );
};

export default PrescriptionGenerator;