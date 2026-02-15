import React from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import type { Author } from '../../data/articles';

interface ExpertCardProps {
    author: Author;
}

export function ExpertCard({ author }: ExpertCardProps) {
    const handleConsultationClick = () => {
        window.open('https://t.me/MitlabtimBot', '_blank');
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-brand-purple-100 p-6 sticky top-24">
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="מומחה מאומת">
                        <CheckCircle size={14} fill="currentColor" className="text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    {author.name}
                </h3>
                <p className="text-sm text-brand-purple-600 font-bold mb-4 uppercase tracking-wide">
                    {author.role}
                </p>

                <div className="w-full h-px bg-gray-100 mb-4" />

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {author.bio}
                </p>

                <button
                    onClick={handleConsultationClick}
                    className="w-full flex items-center justify-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <MessageCircle size={20} />
                    <span>שאלו אותנו בטלגרם</span>
                </button>

                <p className="text-xs text-gray-400 mt-3">
                    *פניה ישירה דרך הבוט בטלגרם
                </p>
            </div>
        </div>
    );
}
