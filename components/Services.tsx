
import React, { useState, useEffect, useRef } from 'react';
import { Page, Service } from '../types.ts';
import ServiceModal from './ServiceModal.tsx';

const servicesData: Service[] = [
    {
        icon: '💡',
        title: 'Consultoria em Pecuária Sustentável',
        summary: 'Desenvolvimento de estratégias personalizadas para aumentar a produtividade e a sustentabilidade da sua fazenda.',
        details: 'Ofereço consultoria técnica especializada para propriedades rurais na Amazônia, com foco em:\n\n- Manejo de pastagens e solos tropicais.\n- Estratégias de mitigação de gases de efeito estufa (GEE).\n- Implementação de sistemas de integração Lavoura-Pecuária-Floresta (ILPF).\n- Melhoria de índices zootécnicos e bem-estar animal.\n- Adequação às normas de certificação de sustentabilidade.',
    },
    {
        icon: '📊',
        title: 'Análise de Viabilidade de Projetos',
        summary: 'Avaliação técnica e econômica para a implementação de projetos de agropecuária de baixo carbono.',
        details: 'Realizo a análise completa da viabilidade de projetos sustentáveis, incluindo:\n\n- Estudo de indicadores de sustentabilidade.\n- Análise de custo-benefício de tecnologias de baixo carbono.\n- Avaliação de elegibilidade para linhas de crédito verde (Plano ABC+).\n- Projeção de resultados produtivos e ambientais.\n- Relatórios técnicos para tomada de decisão e captação de recursos.',
    },
    {
        icon: '🧑‍🏫',
        title: 'Treinamento e Capacitação',
        summary: 'Cursos e palestras para equipes de campo, gestores e estudantes sobre as melhores práticas sustentáveis.',
        details: 'Capacite sua equipe com treinamentos personalizados, abordando temas como:\n\n- Bem-estar animal na produção de ruminantes.\n- Manejo regenerativo de pastagens.\n- Fundamentos da pecuária de baixo carbono.\n- Coleta e interpretação de dados de campo.\n- Novas tecnologias e inovações para o agronegócio sustentável.',
    },
    {
        icon: '🥣',
        title: 'Nutrição Personalizada para Pets',
        summary: 'Criação de planos de dieta personalizados, considerando as necessidades individuais de cada animal para uma vida mais saudável.',
        details: 'O serviço de Nutrição Personalizada para Pets oferece uma abordagem científica para a alimentação do seu cão ou gato. O processo envolve uma análise completa dos seguintes fatores:\n\n- **Espécie e Raça:** Consideramos as particularidades metabólicas de cada raça.\n- **Idade e Estágio de Vida:** As necessidades de um filhote são diferentes das de um animal idoso.\n- **Peso e Escore Corporal:** Avaliamos a condição atual para definir metas realistas.\n- **Objetivo:** Seja para manutenção de peso, perda de peso, ganho de massa ou suporte a condições específicas.\n- **Ingredientes Disponíveis:** Podemos formular dietas com base em alimentos que você já tem ou prefere usar.\n\nCom base nessas informações, calculamos uma ração balanceada, garantindo que seu pet receba todos os nutrientes essenciais para uma saúde ótima.',
    },
    {
        icon: '📚',
        title: 'E-books e Materiais Técnicos',
        summary: 'Acesse guias práticos, artigos e manuais sobre temas relevantes para a pecuária moderna e sustentável.',
        details: '',
        ebooks: [
            { title: 'Guia Prático de Manejo de Pastagens Tropicais', author: 'M.Sc Márcia Salgado', link: '#' },
            { title: 'Introdução à Pecuária de Baixo Carbono', author: 'M.Sc Márcia Salgado', link: '#' },
            { title: 'Bem-Estar Animal: Do Conceito à Prática', author: 'M.Sc Márcia Salgado', link: '#' }
        ]
    }
];

export const Services: React.FC<{ navigateTo: (page: Page) => void }> = ({ navigateTo }) => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in-up');
                        entry.target.classList.remove('opacity-0');
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );

        serviceRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            serviceRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);
    
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-dark font-serif">Serviços Oferecidos</h2>
                    <p className="text-slate-600 max-w-3xl mx-auto mt-2">
                        Soluções baseadas em ciência e experiência prática para impulsionar a sustentabilidade e a rentabilidade do seu negócio no campo.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {servicesData.map((service, index) => (
                        <div
                            key={index}
                            ref={el => serviceRefs.current[index] = el}
                            className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center group opacity-0"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">{service.icon}</div>
                            <h3 className="text-xl font-bold text-dark font-serif mb-2">{service.title}</h3>
                            <p className="text-slate-600 flex-grow">{service.summary}</p>
                            <button 
                                onClick={() => setSelectedService(service)} 
                                className="mt-6 bg-slate-100 text-dark font-semibold py-2 px-5 rounded-lg hover:bg-secondary hover:text-white transition-colors"
                            >
                                Saber Mais
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} navigateTo={navigateTo} />}
        </section>
    );
};

export default Services;
