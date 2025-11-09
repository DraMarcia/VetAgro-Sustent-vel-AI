import React, { useState } from 'react';
import ImageGenerator from './tools/ImageGenerator.tsx';
import VideoGenerator from './tools/VideoGenerator.tsx';
import ImageAnalyzer from './tools/ImageAnalyzer.tsx';
import AudioTranscriber from './tools/AudioTranscriber.tsx';
import MapInquiry from './tools/MapInquiry.tsx';
import ContentAnalyzer from './tools/ContentAnalyzer.tsx';
import ComplexScenarioModeler from './tools/ComplexScenarioModeler.tsx';
import DifferentialDiagnosis from './tools/DifferentialDiagnosis.tsx';
import PlantIdentifier from './tools/PlantIdentifier.tsx';
import RationCalculator from './tools/RationCalculator.tsx';
import ScriptAnalyzer from './tools/ScriptAnalyzer.tsx';
import PrescriptionGenerator from './tools/PrescriptionGenerator.tsx';
import DosageCalculator from './tools/DosageCalculator.tsx';
import ImageEditor from './tools/ImageEditor.tsx';
import VideoAnalyzer from './tools/VideoAnalyzer.tsx';
import LiveAssistant from './tools/LiveAssistant.tsx';
import FieldNotesAnalyzer from './tools/FieldNotesAnalyzer.tsx';

type ToolId = 
    | 'content-analyzer'
    | 'image-analyzer'
    | 'plant-identifier'
    | 'audio-transcriber'
    | 'map-inquiry'
    | 'diff-diagnosis'
    | 'ration-calculator'
    | 'image-gen'
    | 'video-gen'
    | 'script-analyzer'
    | 'scenario-modeler'
    | 'prescription-generator'
    | 'dosage-calculator'
    | 'image-editor'
    | 'video-analyzer'
    | 'live-assistant'
    | 'field-notes-analyzer';

interface Tool {
    id: ToolId;
    title: string;
    description: string;
    component: React.ComponentType;
}

const toolCategories: Record<string, Tool[]> = {
    "Medicina Veterinária": [
        { 
            id: 'diff-diagnosis', 
            title: 'Diagnóstico Diferencial', 
            description: 'Insira sintomas para obter uma lista de possíveis diagnósticos.', 
            component: DifferentialDiagnosis,
        },
        {
            id: 'prescription-generator',
            title: 'Gerador de Receituário',
            description: 'Crie e formate receitas veterinárias de forma rápida e profissional.',
            component: PrescriptionGenerator,
        },
        {
            id: 'dosage-calculator',
            title: 'Calculadora de Doses',
            description: 'Calcule doses de medicamentos de forma precisa e segura.',
            component: DosageCalculator,
        },
    ],
    "Zootecnia e Nutrição Animal": [
        { 
            id: 'ration-calculator', 
            title: 'Calculadora de Ração', 
            description: 'Formule rações balanceadas para diferentes espécies e objetivos.', 
            component: RationCalculator,
        },
    ],
    "Agronomia e Fitotecnia": [
         { 
            id: 'plant-identifier', 
            title: 'Identificador de Plantas', 
            description: 'Identifique plantas e verifique sua toxicidade para animais.', 
            component: PlantIdentifier,
        },
    ],
    "Análise e Mídia": [
         { 
            id: 'content-analyzer', 
            title: 'Analisador de Conteúdo', 
            description: 'Resuma artigos, extraia dados e simplifique textos técnicos.', 
            component: ContentAnalyzer,
        },
        { 
            id: 'image-analyzer', 
            title: 'Analisador de Imagem', 
            description: 'Analise fotos de campo, radiografias ou ultrassonografias.', 
            component: ImageAnalyzer,
        },
        { 
            id: 'video-analyzer', 
            title: 'Analisador de Vídeos', 
            description: 'Extraia informações e análises de clipes de vídeo.', 
            component: VideoAnalyzer,
        },
         { 
            id: 'image-editor', 
            title: 'Editor de Imagens', 
            description: 'Edite imagens com comandos de texto simples.', 
            component: ImageEditor,
        },
        { 
            id: 'image-gen', 
            title: 'Gerador de Imagens', 
            description: 'Crie imagens conceituais para apresentações e relatórios.', 
            component: ImageGenerator,
        },
        { 
            id: 'video-gen', 
            title: 'Gerador de Vídeos', 
            description: 'Produza vídeos curtos e explicativos sobre temas complexos.', 
            component: VideoGenerator,
        },
        { 
            id: 'field-notes-analyzer', 
            title: 'Analisador de Notas de Campo', 
            description: 'Dite suas anotações e a IA irá transcrever e estruturar os dados.', 
            component: FieldNotesAnalyzer,
        },
        { 
            id: 'audio-transcriber', 
            title: 'Transcritor de Áudio Simples', 
            description: 'Grave notas de voz e obtenha a transcrição instantânea.', 
            component: AudioTranscriber,
        },
        { 
            id: 'script-analyzer', 
            title: 'Analisador de Roteiro (via Áudio)', 
            description: 'Envie o áudio de um vídeo para analisar a narração e o conteúdo.', 
            component: ScriptAnalyzer,
        },
        { 
            id: 'live-assistant', 
            title: 'Assistente de Voz (Live)', 
            description: 'Converse em tempo real com a IA por voz.', 
            component: LiveAssistant,
        },
        { 
            id: 'map-inquiry', 
            title: 'Consulta Geoespacial', 
            description: 'Pergunte sobre locais, biomas e iniciativas sustentáveis.', 
            component: MapInquiry,
        },
        { 
            id: 'scenario-modeler', 
            title: 'Modelador de Cenários', 
            description: 'Analise cenários complexos com raciocínio avançado.', 
            component: ComplexScenarioModeler,
        },
    ]
};

const AITools: React.FC = () => {
    const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);
    const [suggestion, setSuggestion] = useState('');

    const handleSuggestionSubmit = () => {
        if (suggestion.trim()) {
            alert('Obrigado pela sua sugestão! Sua contribuição é muito importante para a evolução da plataforma.');
            setSuggestion('');
        }
    };

    const renderToolComponent = () => {
        if (!selectedToolId) return null;
        
        // Find the tool across all categories
        const allTools = Object.values(toolCategories).flat();
        const tool = allTools.find(t => t.id === selectedToolId);

        if (!tool) return null;
        const Component = tool.component;
        return <Component />;
    };
    
    const renderToolGrid = () => (
        <>
            <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-4xl font-bold text-dark font-serif">Suíte de Ferramentas de IA</h2>
                <p className="text-slate-600 max-w-3xl mx-auto mt-2">
                    Explore um conjunto de ferramentas inteligentes projetadas para otimizar diagnósticos, análises e a criação de conteúdo para a agropecuária sustentável.
                </p>
            </div>
            
            {Object.entries(toolCategories).map(([category, tools]) => (
                 <div key={category} className="mb-12">
                    <h3 className="text-2xl font-bold text-primary font-serif mb-6 text-center md:text-left">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tools.map(tool => (
                            <div
                                key={tool.id}
                                onClick={() => setSelectedToolId(tool.id)}
                                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-b-4 border-transparent hover:border-secondary"
                            >
                                <h4 className="text-xl font-bold text-dark font-serif mb-2">{tool.title}</h4>
                                <p className="text-slate-600 text-sm">{tool.description}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            ))}

            {/* User Suggestion Box */}
            <div className="mt-16 p-8 bg-teal-50 border-t-4 border-primary rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-bold text-dark font-serif mb-3">Tem uma ideia para uma nova ferramenta?</h3>
                <p className="text-slate-600 max-w-2xl mx-auto mb-6">
                    Sua sugestão é valiosa! Descreva uma ferramenta que você, como profissional do campo, gostaria de ver na plataforma.
                </p>
                <div className="max-w-xl mx-auto">
                    <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Ex: 'Uma ferramenta que calcula a pegada hídrica da produção...' ou 'Um analisador de laudos de solo...'"
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={3}
                    />
                    <button
                        onClick={handleSuggestionSubmit}
                        className="mt-4 bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition-colors"
                    >
                        Enviar Sugestão
                    </button>
                </div>
            </div>
       </>
    );

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                {selectedToolId ? (
                    <div>
                        <button
                            onClick={() => setSelectedToolId(null)}
                            className="mb-8 bg-slate-100 text-dark font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                           </svg>
                            Voltar para todas as ferramentas
                        </button>
                        <div className="animate-fade-in-up">
                            {renderToolComponent()}
                        </div>
                    </div>
                ) : (
                    renderToolGrid()
                )}
            </div>
        </section>
    );
};

export default AITools;
