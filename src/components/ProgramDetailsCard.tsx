import React from 'react';
import { Card, CardContent } from './ui/shim';
import { Badge } from './ui/shim';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    BookOpen,
    Clock,
    Briefcase,
    GraduationCap,
    MapPin,
    Globe,
    ChevronLeft,
    School
} from 'lucide-react';
import type { AdmissionRequirement, Program, LogicGroup, LogicCondition } from '../types/admission';

interface ProgramDetailsCardProps {
    program: Program;
    admission: AdmissionRequirement;
}

// Logic Helper
const isGroup = (node: LogicGroup | LogicCondition): node is LogicGroup => {
    return 'AND' in node || 'OR' in node;
};

const ConditionItem = ({ condition }: { condition: LogicCondition }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                    <span className="font-medium text-gray-900 block text-sm">
                        {condition.label || `${condition.type} ${condition.operator} ${condition.value}`}
                    </span>
                    {(condition.subject || condition.units) && (
                        <span className="text-xs text-gray-400">
                            {condition.subject} {condition.units ? `(${condition.units} יח"ל)` : ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const LogicRenderer = ({ node, level = 0 }: { node: LogicGroup | LogicCondition; level?: number }) => {
    if (!isGroup(node)) return <ConditionItem condition={node} />;

    // OR Group (Tracks)
    if (node.OR) {
        return (
            <div className="space-y-6">
                {level === 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                            <School className="w-4 h-4 text-blue-700" />
                        </div>
                        <h4 className="font-bold text-gray-900">מסלולי קבלה אפשריים</h4>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {node.OR.map((child, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${level === 0
                                ? 'border-blue-100 bg-blue-50/30 hover:border-blue-300 hover:shadow-md'
                                : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            {/* Track Badge */}
                            {isGroup(child) && child.name && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                                    {child.name}
                                </div>
                            )}

                            <div className="p-5 pt-8">
                                <LogicRenderer node={child} level={level + 1} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // AND Group (Requirements within a track)
    if (node.AND) {
        return (
            <div className="space-y-2">
                {node.name && (
                    <div className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {node.name}
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {node.AND.map((child, idx) => (
                        <div key={idx} className="relative">
                            {idx < node.AND!.length - 1 && (
                                <div className="absolute top-8 bottom-0 right-4 w-px bg-gray-200 z-0" />
                            )}
                            <LogicRenderer node={child} level={level + 1} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

export const ProgramDetailsCard: React.FC<ProgramDetailsCardProps> = ({ program, admission }) => {
    const [imageError, setImageError] = React.useState(false);

    return (
        <div className="bg-white min-h-full">
            {/* Compact Header */}
            <div className="relative h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />

                <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        {/* Logo Box */}
                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 shrink-0">
                            {program.institution?.logo_url && !imageError ? (
                                <img
                                    src={program.institution.logo_url}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <School className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-100 text-xs font-medium">
                                <span className="bg-white/10 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                                    {program.degree_type}
                                </span>
                                <span>•</span>
                                <span>{program.institution?.name}</span>
                                <span>•</span>
                                <span>{program.faculty?.name}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                {program.name}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Content Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {program.description && (
                            <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    על התוכנית
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {program.description}
                                </p>
                            </section>
                        )}

                        {program.career_opportunities && (
                            <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-green-600" />
                                    אפשרויות תעסוקה
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {program.career_opportunities}
                                </p>
                            </section>
                        )}

                        <div className="flex justify-start">
                            <a
                                href={program.institution?.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                מעבר לאתר התוכנית
                                <ChevronLeft className="w-3 h-3 rotate-180" />
                            </a>
                        </div>
                    </div>

                    {/* Sidebar / Requirements */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-sm">תנאי קבלה</h3>
                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                                    {admission.year}
                                </span>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                                <LogicRenderer node={admission.logic_rules} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Simple Icon component for reuse internally context
const Building2Icon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}
    >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
    </svg>
);
