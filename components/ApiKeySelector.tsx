import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and notify the parent component to re-check and proceed.
      onKeySelected();
    } else {
      alert('A função para selecionar a chave de API não está disponível neste ambiente.');
    }
  };

  return (
    <div className="p-6 bg-teal-50 border-t-4 border-primary rounded-lg shadow-md space-y-4 text-center mt-4">
      <div className="flex justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2m4 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m4 0h-4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-dark font-serif">Configure sua Chave de API para Continuar</h3>
      <p className="text-slate-700 max-w-2xl mx-auto">
        Para usar o Gerador de Vídeos (Veo), é necessário selecionar sua própria Chave de API do Google. Isso permite que o uso e a cobrança sejam associados diretamente à sua conta.
      </p>

      <div className="text-left bg-white p-4 rounded-md border max-w-lg mx-auto space-y-2">
        <h4 className="font-semibold text-dark">Como proceder:</h4>
        <p className="text-sm text-slate-600"><strong>1. Clique no botão abaixo:</strong> "Selecionar / Criar Chave de API".</p>
        <p className="text-sm text-slate-600"><strong>2. Siga as instruções:</strong> Uma janela será aberta. Se você já tem uma chave, selecione-a. Se não, siga os passos para criar uma nova no Google AI Studio (é rápido e gratuito para começar).</p>
        <p className="text-sm text-slate-600"><strong>3. Comece a criar:</strong> Após selecionar a chave, a ferramenta de vídeo será liberada para uso.</p>
      </div>

      <button
        onClick={handleSelectKey}
        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary transition-colors transform hover:scale-105 shadow-lg inline-block"
      >
        Selecionar / Criar Chave de API
      </button>

      <p className="text-xs text-slate-500 pt-2">
        Para mais detalhes sobre custos, consulte a{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
          documentação de cobrança da API Gemini
        </a>.
      </p>
    </div>
  );
};