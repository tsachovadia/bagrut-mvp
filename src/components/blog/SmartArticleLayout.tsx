import React, { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import type { Article } from '../../data/articles';
import ReactMarkdown from 'react-markdown';
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
                                <ReactMarkdown components={components}>
                                    {article.content}
                                </ReactMarkdown>
                            </article>

                            {/* Bottom Share */}
                            <div className="mt-16 pt-8 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50 rounded-2xl p-8">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">אהבתם את המאמר?</h4>
                                        <p className="text-gray-500">שתפו אותו עם חברים שמתלבטים</p>
                                    </div>
                                    <button
                                        onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm hover:shadow-md"
                                    >
                                        <Share2 size={18} />
                                        <span>שיתוף מהיר</span>
                                    </button>
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
                <div className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ${showMobileFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                        >
                            <ArrowUp size={20} />
                        </button>
                        <button
                            onClick={() => window.open(`https://wa.me/972546330010?text=${encodeURIComponent(`היי, קראתי את המאמר "${article.title}" ואשמח להתייעץ`)}`, '_blank')}
                            className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors flex items-center gap-2 animate-bounce-subtle"
                        >
                            <MessageCircle size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </HelmetProvider>
    );
}
