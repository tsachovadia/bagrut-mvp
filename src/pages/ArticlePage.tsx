import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articles } from '../data/articles';
import { SmartArticleLayout } from '../components/blog/SmartArticleLayout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = articles.find(a => a.id === id);

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">המאמר לא נמצא</h1>
                        <button
                            onClick={() => navigate('/blog')}
                            className="text-brand-purple-600 hover:underline"
                        >
                            חזרה לבלוג
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <SmartArticleLayout article={article} />
            <Footer />
        </div>
    );
}
