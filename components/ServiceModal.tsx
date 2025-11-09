import React, { useState } from 'react';
import { Page, Service } from '../types.ts';
import { summarizeEbooks } from '../services/geminiService.ts';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface ServiceModalProps {
    service: Service;
    onClose: () => void;
    navigateTo: (page: Page) => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, navigateTo }) => {
    const [summaryText, setSummaryText] = useState(
        "Acesse a seleção de materiais técnicos e guias práticos. Por favor, forneça os links públicos para cada e-book para habilitar os downloads."
    );
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState('');

    const handleContactClick = () => {
        onClose();
        navigateTo('about');
    };

    const handleGenerateSummary = async () => {
        if (!service.ebooks) return;
        setIsSummarizing(true);
        setError('');
        try {
            const summary = await summarizeEbooks(service.ebooks);
            setSummaryText(summary);
        } catch (err) {
            setError('Não foi possível gerar o resumo. Tente novamente.');
            console.error(err);
        } finally {
            setIsSummarizing(false);
        }
    };

    const renderEbookList = () => (
        <div className="space-y-4 text-left">
            <p className="text-center text-slate-600 mb-4">{summaryText}</p>
            
            <div className="text-center mb-6">
                <button 
                    onClick={handleGenerateSummary} 
                    disabled={isSummarizing}
                    className="bg-secondary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary transition-colors disabled:bg-slate-400 flex items-center justify-center mx-auto"
                >
                    {isSummarizing ? (
                        <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Gerando...</span>
                        </>
                    ) : (
                        'Gerar Resumo com IA'
                    )}
                </button>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <ul className="divide-y divide-gray-200">
                {service.ebooks?.map((ebook, index) => (
                    <li key={index} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex-1 mb-2 sm:mb-0">
                            <h4 className="font-semibold text-dark">{ebook.title}</h4>
                            <p className="text-sm text-slate-500">Por: {ebook.author}</p>
                        </div>
                        <a 
                            href={ebook.link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`inline-block bg-accent text-dark font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors ${ebook.link === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => ebook.link === '#' && e.preventDefault()}
                        >
                            Baixar PDF
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderStandardService = () => (
        <>
            <p className="text-slate-700 text-left leading-relaxed whitespace-pre-wrap">{service.details}</p>
            <button 
                onClick={handleContactClick}
                className="mt-6 bg-accent text-dark font-semibold py-3 px-8 rounded-lg hover:bg-amber-600 transition-colors transform hover:scale-105"
            >
                Entrar em Contato
            </button>
        </>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative transform animate-slide-up"
                onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-dark text-2xl"
                    aria-label="Fechar modal"
                >
                    &times;
                </button>
                <div className="text-center">
                    <div className="text-6xl mb-4">{service.icon}</div>
                    <h3 className="text-3xl font-bold text-dark mb-4 font-serif">{service.title}</h3>
                    {service.ebooks && service.ebooks.length > 0 ? renderEbookList() : renderStandardService()}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ServiceModal;