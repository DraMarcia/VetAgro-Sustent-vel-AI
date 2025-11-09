
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-slate-300 mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} VetAgro Sustentável. Todos os direitos reservados.</p>
        <p className="text-sm text-slate-400 mt-2">Promovendo a sustentabilidade na agropecuária amazônica.</p>
      </div>
    </footer>
  );
};