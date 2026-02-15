import React, { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import type { Article } from '../../data/articles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Clock,
    Calendar,
    Share2,
    ChevronRight,
    BookOpen,
    MessageCircle,
    ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExpertCard } from './ExpertCard';

interface SmartArticleLayoutProps {
    article: Article;
}

export function SmartArticleLayout({ article }: SmartArticleLayoutProps) {
    const navigate = useNavigate();
    const [readingProgress, setReadingProgress] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('');
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [showMobileFab, setShowMobileFab] = useState(false);

    // Scroll Progress & TOC Active State
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadingProgress(progress);

            // Show FAB when scrolled down a bit
            setShowMobileFab(window.scrollY > 300);

            // Find active section
            const sections = document.querySelectorAll('h2, h3');
            let current = '';
            sections.forEach((section) => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop < 150) {
                    current = section.id;
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Generate TOC from content
    useEffect(() => {
        const lines = article.content.split('\n');
        const headers: { id: string; text: string; level: number }[] = [];

        lines.forEach((line) => {
            const match = line.match(/^(#{2,3})\s+(.+)/);
            if (match) {
                const level = match[1].length;
                const text = match[2];
                const id = text.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-');
                headers.push({ id, text, level });
            }
        });
        setToc(headers);
    }, [article.content]);

    // Custom renderer for ReactMarkdown to add IDs to headers
    const components = {
        h2: ({ children }: any) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-');
            return <h2 id={id} className="text-2xl font-bold text-gray-900 mt-12 mb-6 scroll-mt-24">{children}</h2>;
        },
        h3: ({ children }: any) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\u0590-\u05FF]+/g, '-');
            return <h3 id={id} className="text-xl font-bold text-gray-800 mt-8 mb-4 scroll-mt-24">{children}</h3>;
        },
        p: ({ children }: any) => <p className="text-lg text-gray-700 leading-relaxed mb-6">{children}</p>,
        ul: ({ children }: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 text-lg">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700 text-lg">{children}</ol>,
        blockquote: ({ children }: any) => (
            <blockquote className="border-r-4 border-brand-purple-500 bg-brand-purple-50 p-6 rounded-l-xl my-8 text-xl font-medium text-brand-purple-900 italic">
                {children}
            </blockquote>
        ),
        table: ({ children }: any) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-gray-200">
                <table className="w-full text-sm text-right">{children}</table>
            </div>
        ),
        thead: ({ children }: any) => <thead className="bg-brand-purple-50 text-brand-purple-900 font-bold text-xs uppercase tracking-wider">{children}</thead>,
        tbody: ({ children }: any) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
        tr: ({ children }: any) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
        th: ({ children }: any) => <th className="px-4 py-3 font-bold whitespace-nowrap">{children}</th>,
        td: ({ children }: any) => <td className="px-4 py-3 text-gray-700">{children}</td>,
    };

    // Schema.org Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "image": article.imageUrl,
        "author": {
            "@type": "Person",
            "name": article.author.name,
            "url": article.author.socialLinks?.[0]?.url
        },
        "datePublished": article.date,
        "description": article.excerpt
    };

    return (
        <HelmetProvider>
            <div className="min-h-screen bg-white text-gray-900 font-sans" dir="rtl">
                <Helmet>
                    <title>{article.title} | מתלבטים בלימודים</title>
                    <meta name="description" content={article.excerpt} />
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                </Helmet>

                {/* Progress Bar */}
                <div className="fixed top-0 left-0 h-1.5 bg-brand-purple-600 z-50 transition-all duration-300 transform origin-left rtl:origin-right"
                    style={{ width: `${readingProgress}%` }} />

                <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-12 overflow-x-auto whitespace-nowrap">
                        <button onClick={() => navigate('/')} className="hover:text-brand-purple-600 transition-colors">דף הבית</button>
                        <ChevronRight size={14} />
                        <button onClick={() => navigate('/blog')} className="hover:text-brand-purple-600 transition-colors">בלוג</button>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{article.title}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content Area */}
                        <main className="lg:col-span-8 lg:pl-12">
                            {/* Article Header */}
                            <header className="mb-10">
                                <div className="flex gap-2 mb-6">
                                    {article.tags.map(tag => (
                                        <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full bg-brand-purple-50 text-brand-purple-700 tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                                    {article.title}
                                </h1>

                                {/* Meta Line */}
                                <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium border-b border-gray-100 pb-8">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={article.author.avatarUrl}
                                            alt={article.author.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="text-gray-900">{article.author.name}</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        {article.date}
                                    </span>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="flex items-center gap-2 text-brand-purple-600">
                                        <Clock size={16} />
                                        {article.readTime}
                                    </span>
                                </div>
                            </header>

                            {/* TL;DR Box */}
                            <div className="bg-brand-purple-50/50 border border-brand-purple-100 rounded-2xl p-6 md:p-8 mb-12">
                                <h3 className="text-lg font-bold text-brand-purple-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">💡</span>
                                    במשפט אחד
                                </h3>
                                <p className="text-lg text-brand-purple-900/80 leading-relaxed">
                                    {article.excerpt}
                                </p>
                            </div>

                            {/* Article Body */}
                            <article className="prose prose-lg prose-purple max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                                    {article.content}
                                </ReactMarkdown>
                            </article>

                            {/* Bottom Share */}
                            <div className="mt-16 pt-8 border-t border-gray-100">
                                <div className="bg-gradient-to-br from-brand-purple-50 to-white rounded-2xl p-8 text-center">
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">מכירים מישהו שמתלבט?</h4>
                                    <p className="text-gray-500 mb-6 text-sm">שלחו להם את הכתבה — זה יכול לעזור להם בהחלטה</p>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        <a
                                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            <span>וואטסאפ</span>
                                        </a>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                            <span>פייסבוק</span>
                                        </a>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('הקישור הועתק!');
                                            }}
                                            className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-purple-300 text-gray-700 font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                                        >
                                            <Share2 size={18} />
                                            <span>העתקת קישור</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Sidebar (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-4 space-y-8">
                            <ExpertCard author={article.author} />

                            {/* Sticky TOC */}
                            <div className="bg-gray-50 rounded-2xl p-6 sticky top-[500px]">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
                                    <BookOpen size={16} />
                                    תוכן העניינים
                                </h4>
                                <nav className="space-y-1 max-h-[calc(100vh-600px)] overflow-y-auto custom-scrollbar pr-2">
                                    {toc.map(item => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block text-sm py-2 px-3 rounded-lg transition-all border-r-2 ${activeSection === item.id
                                                    ? 'bg-white border-brand-purple-600 text-brand-purple-700 font-bold shadow-sm'
                                                    : 'border-transparent text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
                                                } ${item.level === 3 ? 'mr-4 text-xs' : ''}`}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Mobile Floating Action Button (FAB) */}
                <div className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ${showMobileFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                        >
                            <ArrowUp size={20} />
                        </button>
                        <button
                            onClick={() => window.open('https://t.me/MitlabtimBot', '_blank')}
                            className="bg-[#2AABEE] text-white p-4 rounded-full shadow-lg hover:bg-[#229ED9] transition-colors flex items-center gap-2 animate-bounce-subtle"
                        >
                            <MessageCircle size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </HelmetProvider>
    );
}
