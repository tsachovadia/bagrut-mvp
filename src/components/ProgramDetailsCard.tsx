import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/shim';
import { Badge } from './ui/shim';
import { CheckCircle, XCircle, AlertCircle, BookOpen, Clock, Briefcase, GraduationCap } from 'lucide-react';
import type { AdmissionRequirement, Program, LogicGroup, LogicCondition } from '../types/admission';

interface ProgramDetailsCardProps {
    program: Program;
    admission: AdmissionRequirement;
}

// Helper to determine if a node is a Group or a Condition
const isGroup = (node: LogicGroup | LogicCondition): node is LogicGroup => {
    return 'AND' in node || 'OR' in node;
};

const ConditionItem = ({ condition }: { condition: LogicCondition }) => {
    // In a real app, we would compare against user data here to choose color/icon
    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm mb-2">
            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <CheckCircle className="w-4 h-4" />
            </div>
            <div>
                <p className="font-medium text-gray-800 text-sm">
                    {condition.label || `${condition.type} ${condition.operator} ${condition.value}`}
                </p>
                {/* Optional: Add subtitle or helper text */}
            </div>
        </div>
    );
};

const LogicRenderer = ({ node, level = 0 }: { node: LogicGroup | LogicCondition; level?: number }) => {
    if (!isGroup(node)) {
        return <ConditionItem condition={node} />;
    }

    // It's a group
    if (node.OR) {
        return (
            <div className="space-y-4">
                {level === 0 && <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">אפשרויות קבלה (מסלולים)</h4>}

                <div className="grid gap-4 md:grid-cols-2">
                    {node.OR.map((child, idx) => (
                        <div key={idx} className={`bg-gray-50 rounded-xl p-4 border-2 ${level === 0 ? 'border-blue-100 hover:border-blue-300' : 'border-gray-200'}`}>
                            {isGroup(child) && child.name && (
                                <Badge className="mb-3 bg-blue-600 hover:bg-blue-700 text-white border-0">
                                    {child.name}
                                </Badge>
                            )}
                            <LogicRenderer node={child} level={level + 1} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (node.AND) {
        return (
            <div className="space-y-1">
                {node.name && (
                    <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        {node.name}
                    </div>
                )}
                {node.AND.map((child, idx) => (
                    <LogicRenderer key={idx} node={child} level={level + 1} />
                ))}
            </div>
        );
    }

    return null;
};

export const ProgramDetailsCard: React.FC<ProgramDetailsCardProps> = ({ program, admission }) => {
    return (
        <Card className="w-full shadow-lg border-gray-200 overflow-hidden bg-white mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-100 mb-1 text-sm font-medium">
                            <GraduationCap className="w-4 h-4" />
                            {program.institution?.name} • {program.faculty?.name}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{program.name}</h2>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm">
                                {program.degree_type}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {program.duration_years} שנים
                            </Badge>
                        </div>
                    </div>
                    {/* Placeholder for Logo */}
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xs">
                            LOGO
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-6">
                {/* Marketing / Description */}
                {(program.description || program.career_opportunities) && (
                    <div className="mb-8 grid md:grid-cols-2 gap-6">
                        {program.description && (
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    על התוכנית
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {program.description}
                                </p>
                            </div>
                        )}
                        {program.career_opportunities && (
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-50">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                    <Briefcase className="w-4 h-4 text-green-600" />
                                    אפשרויות תעסוקה
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {program.career_opportunities}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Admission Requirements Logic */}
                <div className="bg-white rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-900">תנאי קבלה</h3>
                    </div>

                    <div className="p-1">
                        <LogicRenderer node={admission.logic_rules} />
                    </div>

                    <div className="mt-4 text-xs text-gray-400 text-center">
                        * המידע מוצג כשירות לציבור. הקבלה בפועל תלויה בהחלטת המוסד בלבד.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
