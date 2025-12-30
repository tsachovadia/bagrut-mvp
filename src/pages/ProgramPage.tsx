
import { useParams, useNavigate } from 'react-router-dom';
import { ProgramDetailsCard } from '../components/ProgramDetailsCard';
import { ChevronRight } from 'lucide-react';
import { ALL_PROGRAMS } from '../data/programs';
import { Footer } from '../components/Footer';

export const ProgramPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const selected = ALL_PROGRAMS.find((p) => p.program.id === id);

    if (!selected) {
        // Fallback or Loading state
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">טוען תוכנית...</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">
                        חזרה לדף הבית
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Navigation Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors py-2 pr-2 rounded-lg hover:bg-gray-100/50"
                    >
                        <ChevronRight className="w-5 h-5" />
                        <span className="font-medium">חזרה</span>
                    </button>
                </div>
            </div>

            {/* Content - Removed the padding wrapper to allow full bleed */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProgramDetailsCard
                    program={selected.program}
                    admission={selected.admission}
                />
            </div>
            <Footer />
        </div>
    );
};
