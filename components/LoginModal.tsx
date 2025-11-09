
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691c-1.229 1.99-1.99 4.29-1.99 6.809C4.316 23.31 5.077 25.61 6.306 27.5l-5.657 5.657C-1.031 30.655-2 27.425-2 24c0-3.425.969-6.655 2.657-9.35l5.657 5.041z" />
        <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.07 39.677 27.218 41 24 41c-5.223 0-9.651-3.343-11.303-7.962H6.389C9.387 42.602 16.121 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083L43.595 20H24v8h11.303a12.023 12.023 0 0 1-5.022 5.57l5.657 5.657C42.872 35.845 48 28.602 48 20c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, loginWithGoogle } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleAuth = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose();
        } catch (err: any) {
            setError(err.message || "Falha ao autenticar com o Google.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-dark/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-4 text-2xl text-slate-400 hover:text-dark">&times;</button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-dark font-serif mb-2">{isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
                    <p className="text-slate-600 mb-6">{isLoginView ? 'Acesse sua conta para continuar.' : 'É rápido e fácil.'}</p>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <GoogleIcon />
                        <span className="font-semibold text-slate-700">{isLoginView ? 'Entrar com Google' : 'Cadastrar com Google'}</span>
                    </button>

                    <div className="flex items-center">
                        <hr className="flex-grow border-t" />
                        <span className="px-2 text-xs text-slate-500">OU</span>
                        <hr className="flex-grow border-t" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginView && (
                            <input
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="Seu nome" required
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        )}
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="Seu e-mail" required
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Sua senha" required
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary disabled:bg-gray-400 transition-colors flex justify-center items-center"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : (isLoginView ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-6 text-sm">
                    <p className="text-slate-600">
                        {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button onClick={() => {setIsLoginView(!isLoginView); setError('')}} className="font-semibold text-primary hover:underline ml-1">
                            {isLoginView ? 'Cadastre-se' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LoginModal;
