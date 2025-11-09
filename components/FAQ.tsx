import React from 'react';

const FAQItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-l-4 border-gray-200 pl-6 py-2 transition-all hover:border-secondary">
        <h4 className="font-bold text-lg text-dark">{title}</h4>
        <div className="text-slate-600 mt-1 space-y-2">{children}</div>
    </div>
);

const FAQ = () => {
    return (
        <section className="py-12 animate-fade-in-up">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-dark font-serif">Perguntas Frequentes (FAQ)</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mt-2">
                        Encontre respostas para as dúvidas mais comuns sobre o uso da plataforma e suas ferramentas.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-primary font-serif mb-4">O que fazer quando uma ferramenta de IA apresenta um erro?</h3>
                        <p className="text-slate-700 mb-8">
                            Encontrar um erro pode ser frustrante, mas a maioria dos problemas tem uma solução simples. Siga este guia prático para resolver a questão rapidamente.
                        </p>

                        <div className="space-y-6">
                            <FAQItem title="1. Leia a Mensagem com Atenção">
                                <p>
                                    O primeiro passo é sempre ler a mensagem. O aplicativo tenta ser o mais específico possível e o alerta de erro geralmente indicará a causa do problema.
                                </p>
                            </FAQItem>

                            <FAQItem title="&quot;Limite de Uso Atingido&quot; ou &quot;Créditos Insuficientes&quot;">
                                <p>
                                    <strong>O que significa:</strong> Você usou todas as suas tentativas gratuitas para aquela ferramenta no dia ou não tem créditos suficientes.
                                </p>
                                <p>
                                    <strong>O que fazer:</strong> A maioria das cotas gratuitas é reiniciada a cada 24 horas. A solução mais simples é aguardar e tentar novamente no dia seguinte.
                                </p>
                            </FAQItem>
                            
                            <FAQItem title="&quot;Por favor, insira um prompt&quot; ou &quot;Carregue uma imagem&quot;">
                                <p>
                                    <strong>O que significa:</strong> Faltou alguma informação essencial para a ferramenta funcionar.
                                </p>
                                <p>
                                    <strong>O que fazer:</strong> Preencha todos os campos obrigatórios e tente novamente. O aplicativo não apagará o que você já digitou.
                                </p>
                            </FAQItem>

                            <FAQItem title="&quot;Falha na conexão&quot; ou &quot;Erro de rede&quot;">
                                <p>
                                    <strong>O que significa:</strong> O aplicativo não conseguiu se comunicar com os servidores da IA, geralmente por um problema com sua conexão à internet.
                                </p>
                                <p>
                                    <strong>O que fazer:</strong> Verifique sua conexão. Se estiver tudo certo, aguarde um minuto e tente novamente, pois pode ter sido uma instabilidade momentânea.
                                </p>
                            </FAQItem>
                            
                             <FAQItem title="&quot;Falha ao gerar/analisar. Tente novamente&quot;">
                                <p>
                                    <strong>O que significa:</strong> Um erro mais genérico que pode ocorrer por uma sobrecarga temporária no servidor da IA ou um prompt muito complexo que a IA não conseguiu processar.
                                </p>
                                <p>
                                    <strong>O que fazer:</strong> Primeiro, tente reenviar sua solicitação. Se não funcionar, tente simplificar seu pedido (prompt). Se o erro persistir, entre em contato através da página "Sobre Mim".
                                </p>
                            </FAQItem>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
