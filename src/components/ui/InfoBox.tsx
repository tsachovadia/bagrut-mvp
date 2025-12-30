import { Info } from 'lucide-react';

interface InfoBoxProps {
    title?: string;
    text: string;
    className?: string;
}

export function InfoBox({ title, text, className = '' }: InfoBoxProps) {
    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 ${className}`}>
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
                {title && <h4 className="font-semibold mb-1 text-blue-900">{title}</h4>}
                <p className="leading-relaxed opacity-90">{text}</p>
            </div>
        </div>
    );
}
