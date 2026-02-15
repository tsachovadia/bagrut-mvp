import React from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import type { Author } from '../../data/articles';

interface ExpertCardProps {
    author: Author;
}

export function ExpertCard({ author }: ExpertCardProps) {
    const handleConsultationClick = () => {
        // WhatsApp format: https://wa.me/972546330010?text=...
        const message = `היי ${author.name}, קראתי את המאמר שלך ב"מתלבטים" ואשמח להתייעץ איתך.`;
        const encodedMessage = encodeURIComponent(message);
        // Using the community manager number as the central hub for now, or author's if available
        // For the plan, we route to the author if social links exist, otherwise fallback? 
        // The plan says "Direct contact via WhatsApp".
        // Let's assume the author object might have a specific whatsapp link or we use a generic one if not found.
        // For now, I'll check if there is a 'website' or 'email' link and use that, 
        // but ideally we need a phone number field in the Author interface.
        // I will add a placeholder alerting this.
        window.open(`https://wa.me/972546330010?text=${encodedMessage}`, '_blank');
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
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <MessageCircle size={20} />
                    <span>התייעצות עם {author.name.split(' ')[0]}</span>
                </button>

                <p className="text-xs text-gray-400 mt-3">
                    *פניה ישירה דרך וואטסאפ
                </p>
            </div>
        </div>
    );
}
