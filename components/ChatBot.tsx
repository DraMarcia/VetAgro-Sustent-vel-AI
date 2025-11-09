import React, { useState, useRef, useEffect } from 'react';
// Fix: Added .ts extension to resolve module not found error.
import { streamChatMessage } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

const initialMessage: ChatMessage[] = [
  { role: 'model', text: 'Olá! Sou seu assistente de IA. Como posso ajudar com veterinária ou agropecuária sustentável hoje?' },
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Garante que não carreguemos um array vazio ou inválido
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          return parsedHistory;
        }
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
    return initialMessage;
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Salva o histórico no localStorage sempre que as mensagens mudam
  useEffect(() => {
    try {
        // Não salva o estado inicial, apenas conversas reais
        if (messages.length > 1) {
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    const modelMessage: ChatMessage = { role: 'model', text: '', isError: false };
    setMessages(prev => [...prev, modelMessage]);

    await streamChatMessage(input, (chunk, isError) => {
      if (isError) {
        fullResponse = chunk; // On error, replace content with the error message.
      } else {
        fullResponse += chunk; // On success, append stream chunks.
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'model') {
            lastMessage.text = fullResponse;
            if (isError) {
              lastMessage.isError = true;
            }
        }
        return newMessages;
      });
    });
    
    setIsLoading(false);
  };
  
  const handleClearHistory = () => {
      if (window.confirm('Tem certeza de que deseja apagar o histórico da conversa?')) {
          setMessages(initialMessage);
          try {
              localStorage.removeItem('chatHistory');
          } catch (error) {
              console.error("Failed to clear chat history from localStorage", error);
          }
      }
  };

  return (
    <>
      <div className={`fixed bottom-5 left-5 z-50 transition-transform duration-300 ${isOpen ? '-translate-x-full pointer-events-none' : 'translate-x-0'}`}>
        <button onClick={() => setIsOpen(true)} className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent animate-subtle-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM12.9 12.3l.96-3.36c.21-.71-.24-1.44-.99-1.44H12c-.55 0-1 .45-1 1s.45 1 1 1h.44l-.69 2.41-1.38-.46c-.44-.15-.9.16-.9.63 0 .28.16.53.41.65l3.31 1.57c.43.2.92.01 1.13-.42l.96-3.36.43.15c.34.12.71-.05.88-.38s.05-.71-.23-.88l-.68-.24z"/>
            </svg>
        </button>
      </div>
      <div className={`fixed bottom-0 left-0 z-50 h-full w-full md:h-2/3 md:w-1/3 lg:w-1/4 bg-white shadow-2xl rounded-t-lg md:rounded-r-lg flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${!isOpen ? 'pointer-events-none' : ''}`}>
        <header className="bg-primary text-white p-4 flex justify-between items-center rounded-t-lg md:rounded-none md:rounded-tr-lg">
          <div className="flex items-center gap-3">
             <h3 className="font-bold text-lg">Assistente IA</h3>
             <button 
                onClick={handleClearHistory} 
                className="text-white hover:opacity-75"
                title="Limpar histórico"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-2xl font-bold leading-none hover:opacity-75">&times;</button>
        </header>
        <div className="flex-1 p-4 overflow-y-auto bg-light">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 my-1 rounded-lg shadow ${
                msg.role === 'user' 
                    ? 'bg-secondary text-white' 
                    : msg.isError 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-white text-dark'
              }`}>
                {msg.text || <span className="animate-pulse">...</span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t bg-white">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Digite sua pergunta..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-secondary disabled:bg-gray-400">
              {isLoading ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
       <style>{`
          @keyframes subtle-pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
          }
          .animate-subtle-pulse {
              animation: subtle-pulse 2s infinite;
          }
      `}</style>
    </>
  );
};