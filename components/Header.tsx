
import React, { useState } from 'react';
import { Page } from '../types.ts';
import { useCredits } from '../contexts/CreditContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface HeaderProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
  onLoginClick: () => void;
}

const NavLink: React.FC<{ page: Page; label: string; currentPage: Page; onClick: (page: Page) => void; }> = ({ page, label, currentPage, onClick }) => (
  <button
    onClick={() => onClick(page)}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      currentPage === page
        ? 'bg-primary text-white'
        : 'text-dark hover:bg-primary/10 hover:text-primary'
    }`}
  >
    {label}
  </button>
);

const CreditDisplay: React.FC = () => {
    const { credits } = useCredits();
    return (
        <div className="flex items-center gap-2 bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-sm">
            <span>{credits}</span>
            <span title="Créditos">🪙</span>
        </div>
    );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="relative group">
       <button className="flex items-center justify-center h-10 w-10 bg-primary text-white rounded-full font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
       </button>
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100">
        <div className="px-4 py-2 border-b">
          <p className="text-sm font-semibold text-dark truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <div className="px-4 py-2">
           <CreditDisplay />
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // FIX: Destructure 'logout' from useAuth hook to make it available in the component scope.
  const { user, logout } = useAuth();

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'about', label: 'Sobre Mim' },
    { page: 'services', label: 'Serviços' },
    { page: 'tools', label: 'Ferramentas IA' },
    { page: 'news', label: 'Blog' },
    { page: 'faq', label: 'FAQ' },
  ];

  return (
    <header className="bg-light/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
               <button onClick={() => navigateTo('home')} className="text-2xl font-bold text-primary font-serif">VetAgro Sustentável AI</button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map(item => (
                <NavLink key={item.page} {...item} currentPage={currentPage} onClick={navigateTo} />
              ))}
              {user ? (
                <UserMenu />
              ) : (
                <button onClick={onLoginClick} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
                  Entrar
                </button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
             <div className="mr-4">
                {user ? <CreditDisplay /> : null }
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-primary/10 inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-white hover:bg-primary focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
               <button
                key={item.page}
                onClick={() => { navigateTo(item.page); setIsMenuOpen(false); }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  currentPage === item.page
                    ? 'bg-primary text-white'
                    : 'text-dark hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
             <div className="p-3 border-t mt-2">
                {user ? (
                   <div className="space-y-2">
                     <p className="font-semibold">{user.name}</p>
                     <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left text-primary font-bold">Sair</button>
                   </div>
                ) : (
                    <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg">
                        Entrar / Cadastrar
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
