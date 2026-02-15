import React from 'react';
import { Helmet } from 'react-helmet-async';
import { articles } from '../data/articles';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function BlogPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Helmet>
                <title>בלוג — מתלבטים בלימודים</title>
                <meta name="description" content="מאמרים, טיפים ומדריכים על בגרויות, פסיכומטרי, ימים פתוחים וקבלה לאוניברסיטה. כל מה שצריך לדעת לפני שבוחרים תואר." />
                <link rel="canonical" href="https://mitlabtim.co.il/blog" />
            </Helmet>
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">הבלוג שלנו</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        מאמרים, טיפים ותובנות שיעזרו לכם לקבל את ההחלטות הנכונות לגבי העתיד שלכם.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            onClick={() => navigate(`/blog/${article.id}`)}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full group"
                        >
                            {article.imageUrl && (
                                <div className="w-full h-48 overflow-hidden">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    {article.tags.map((tag) => (
                                        <span key={tag} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-purple-50 text-brand-purple-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple-600 transition-colors">
                                    {article.title}
                                </h2>

                                <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                                    {article.excerpt}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {article.author.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {article.readTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main >

            <Footer />
        </div >
    );
}
