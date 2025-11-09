import React, { useState, useMemo, useEffect, useRef } from 'react';
import { blogData, NewsItem } from './blogData.ts';
import { blogCategoryImages } from './blogImageData.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';


const ITEMS_PER_PAGE = 6;

type NewsItemWithCategory = NewsItem & { category: string };

const NewsCard: React.FC<{ item: NewsItemWithCategory }> = ({ item }) => (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-secondary flex flex-col h-full">
        <div className="flex-grow">
            <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full mb-2">{item.category}</span>
            <h4 className="font-bold text-dark text-md">{item.title}</h4>
        </div>
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium truncate pr-2">
                <span>{item.source}</span>
                <span className="mx-1">·</span>
                <span>{new Date(item.publishedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:text-secondary transition-colors whitespace-nowrap">
                Ler notícia &rarr;
            </a>
        </div>
    </div>
);

const CategoryHeader: React.FC<{ categoryName: string; description: string; }> = ({ categoryName, description }) => {
    const storageKey = `blog-category-image-${categoryName.replace(/\s+/g, '-')}`;
    const [imageUrl, setImageUrl] = useLocalStorage(storageKey);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultImage = blogCategoryImages[categoryName] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative group mb-12 rounded-xl overflow-hidden shadow-xl" >
            <img src={imageUrl || defaultImage} alt={categoryName} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-dark/60 flex flex-col justify-center items-center text-center p-4">
                <h3 className="text-4xl font-bold text-white font-serif">{categoryName}</h3>
                <p className="text-white/90 mt-2 max-w-2xl">{description}</p>
            </div>
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="bg-white/80 text-dark text-xs font-bold py-1 px-3 rounded-full hover:bg-white transition-colors"
                >
                    Alterar Imagem
                </button>
                {imageUrl && (
                    <button 
                        onClick={() => setImageUrl(null)} 
                        className="bg-red-500/80 text-white text-xs font-bold h-6 w-6 rounded-full hover:bg-red-500 transition-colors flex items-center justify-center"
                        aria-label="Remover imagem customizada"
                    >
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
};


const Blog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [selectedDate, setSelectedDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const categories = useMemo(() => ['Todos', ...Object.keys(blogData || {})], [blogData]);

    const filteredNewsItems = useMemo(() => {
        if (!blogData || Object.keys(blogData).length === 0) {
            return [];
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const categoriesToFilter = selectedCategory === 'Todos' ? Object.keys(blogData) : [selectedCategory];

        const allItems: NewsItemWithCategory[] = [];
        categoriesToFilter.forEach(category => {
            const categoryData = blogData[category];
            if (categoryData?.items) {
                const filteredItems = categoryData.items
                    .filter(item =>
                        (item.title.toLowerCase().includes(lowercasedTerm) ||
                        item.source.toLowerCase().includes(lowercasedTerm)) &&
                        (!selectedDate || item.publishedDate >= selectedDate)
                    )
                    .map(item => ({ ...item, category }));
                
                allItems.push(...filteredItems);
            }
        });

        // Sort by date, newest first
        allItems.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        
        return allItems;
    }, [searchTerm, selectedCategory, selectedDate, blogData]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedDate]);
    
    const paginatedData = useMemo(() => {
        const totalItems = filteredNewsItems.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const currentItems = filteredNewsItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        return { currentItems, totalPages };
    }, [filteredNewsItems, currentPage]);


    const hasResults = paginatedData.currentItems.length > 0;
    
    const handleNextPage = () => {
        if (currentPage < paginatedData.totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };


    return (
        <section className="py-12 animate-fade-in-up">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-dark font-serif">Blog & Notícias</h2>
                    <p className="text-slate-600 max-w-3xl mx-auto mt-2">
                        Mantenha-se atualizado com as últimas notícias e artigos sobre pecuária, saúde animal e sustentabilidade.
                    </p>
                </div>

                {/* Filtros e Busca */}
                <div className="sticky top-16 bg-light/90 backdrop-blur-sm z-40 py-4 mb-8 rounded-lg shadow-sm">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Buscar por título ou fonte..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none shadow-inner"
                            />
                        </div>
                        <div className="md:col-span-1">
                             <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none shadow-inner appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                         <div className="md:col-span-1">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none shadow-inner"
                                aria-label="Filtrar por data de publicação a partir de"
                            />
                        </div>
                    </div>
                </div>
                
                 {selectedCategory !== 'Todos' && blogData[selectedCategory] && (
                    <CategoryHeader 
                        categoryName={selectedCategory} 
                        description={blogData[selectedCategory].description} 
                    />
                )}

                {/* Conteúdo do Blog */}
                <div className="max-w-5xl mx-auto">
                    {hasResults ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedData.currentItems.map((item) => (
                                    <NewsCard key={`${item.title}-${item.source}-${item.publishedDate}`} item={item} />
                                ))}
                            </div>

                            {paginatedData.totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-4">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="bg-white border border-slate-300 text-dark font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        &larr; Anterior
                                    </button>
                                    <span className="text-sm text-slate-700 font-medium">
                                        Página {currentPage} de {paginatedData.totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === paginatedData.totalPages}
                                        className="bg-white border border-slate-300 text-dark font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Próxima &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold text-dark">Nenhum resultado encontrado</h3>
                            <p className="text-slate-500 mt-2">Tente ajustar sua busca ou filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Blog;