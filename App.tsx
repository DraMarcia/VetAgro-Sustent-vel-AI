
import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ChatBot } from './components/ChatBot.tsx';
import { CreditProvider } from './contexts/CreditContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { Page } from './types.ts';
import LoginModal from './components/LoginModal.tsx';
import SkeletonLoader from './components/SkeletonLoader.tsx';

// Lazy imports are already correct with .tsx extension
const Hero = lazy(() => import('./components/Hero.tsx'));
const AISuite = lazy(() => import('./components/AITools.tsx'));
const About = lazy(() => import('./components/About.tsx'));
const Services = lazy(() => import('./components/Services.tsx'));
const Blog = lazy(() => import('./components/Blog.tsx'));
const FAQ = lazy(() => import('./components/FAQ.tsx'));

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Hero navigateTo={navigateTo} onLoginClick={() => setIsLoginModalOpen(true)} />;
      case 'tools':
        return <AISuite />;
      case 'about':
        return <About />;
      case 'services':
        return <Services navigateTo={navigateTo} />;
      case 'news':
        return <Blog />;
      case 'faq':
        return <FAQ />;
      default:
        return <Hero navigateTo={navigateTo} onLoginClick={() => setIsLoginModalOpen(true)} />;
    }
  };

  return (
    <AuthProvider>
      <CreditProvider>
        <div className="bg-light min-h-screen flex flex-col font-sans text-dark">
          <Header 
            navigateTo={navigateTo} 
            currentPage={currentPage} 
            onLoginClick={() => setIsLoginModalOpen(true)} 
          />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<SkeletonLoader />}>
              {renderPage()}
            </Suspense>
          </main>
          <Footer />
          <ChatBot />
          <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </div>
      </CreditProvider>
    </AuthProvider>
  );
}