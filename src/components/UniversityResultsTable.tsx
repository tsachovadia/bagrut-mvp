import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/shim';
import { CheckCircle, XCircle, ArrowUp, MessageCircle } from "lucide-react";
import { getDegree } from '../utils/degrees';

interface UniversityAverage {
    university: string;
    average: number;
    description: string;
    calculation: string;
    sechem: any[];
}

interface UniversityResultsTableProps {
    averages: UniversityAverage[];
    originalAverages?: UniversityAverage[] | null;
}

export const UniversityResultsTable: React.FC<UniversityResultsTableProps> = ({ averages, originalAverages }) => {
    const [showAll, setShowAll] = React.useState(false);

    // Sort so "Accepted" comes first if not simulated, otherwise stick to stable sort
    const displayedAverages = showAll ? averages : averages.slice(0, 5);

    // Hardcoded target for MVP context
    const targetDegree = getDegree(1); // CS

    return (

        <Card className="w-full mt-10">
            <CardHeader className="bg-white/50 border-b border-gray-100/50 pb-2 pt-4">
                <CardTitle className="text-xl font-bold text-center text-[#1d1d1f] tracking-tight">
                    תוצאות קבלה
                </CardTitle>
                <div className="text-center text-gray-500 font-medium mt-1 text-xs">
                    עבור: <span className="text-[#0071E3]">{targetDegree?.degree_name || "מדעי המחשב"}</span> (סף משוער: {targetDegree?.threshold})
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100/50 hover:bg-transparent">
                                <TableHead className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">אוניברסיטה</TableHead>
                                <TableHead className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">סכם שחושב</TableHead>
                                <TableHead className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">סטטוס קבלה</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedAverages.map((avg, index) => {
                                // Find original for diff
                                const original = originalAverages ? originalAverages.find(o => o.university === avg.university) : null;
                                const currentScore = avg.sechem[0]?.score || 0;
                                const originalScore = original?.sechem[0]?.score || 0;

                                const isImprovement = original && currentScore > originalScore;
                                const diff = original ? (currentScore - originalScore).toFixed(0) : 0;

                                const currentStatus = currentScore >= (targetDegree?.threshold || 600) ? 'accepted' : 'rejected';
                                const statusChanged = original && (originalScore >= (targetDegree?.threshold || 600) ? 'accepted' : 'rejected') !== currentStatus;

                                return (
                                    <TableRow key={index} className="group hover:bg-white/60 transition-colors border-b border-gray-50/50 last:border-0">
                                        <TableCell className="py-2 font-medium">
                                            <div className="font-bold text-sm text-[#1d1d1f] mb-0.5">{avg.university}</div>
                                            <div className="text-[10px] text-gray-500 font-normal">{avg.sechem[0]?.name}</div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg font-bold tracking-tight text-[#0071E3]">
                                                    {currentScore.toFixed(0)}
                                                </span>
                                                {isImprovement && (
                                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full animate-in fade-in zoom-in duration-300 shadow-sm border border-green-100/50">
                                                        <ArrowUp className="w-3 h-3 mr-0.5" />
                                                        {diff}+
                                                    </span>
                                                )}
                                                {original && !isImprovement && Math.abs(currentScore - originalScore) < 1 && (
                                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-2">
                                                {currentStatus === 'accepted' ? (
                                                    <Badge className={`bg-green-100/80 text-green-800 border-0 hover:bg-green-200/80 transition-colors backdrop-blur-md flex items-center gap-1 py-1 px-2 text-xs font-medium rounded-full shadow-sm ${statusChanged ? 'ring-2 ring-green-400/50 ring-offset-2 animate-bounce-subtle' : ''}`}>
                                                        <CheckCircle className="w-3 h-3" />
                                                        קבלה
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-50/80 text-red-700 border-0 hover:bg-red-100/80 backdrop-blur-md flex items-center gap-1 py-1 px-2 text-xs font-medium rounded-full shadow-sm">
                                                        <XCircle className="w-3 h-3" />
                                                        דחייה
                                                    </Badge>
                                                )}

                                                {statusChanged && currentStatus === 'accepted' && (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-[#0071E3] px-1.5 py-0 rounded-full animate-pulse shadow-md shadow-blue-500/30">
                                                        חדש!
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {averages.length > 5 && (
                    <div className="relative pt-6 pb-6 px-4">
                        {!showAll && (
                            <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white/80 pointer-events-none" />
                        )}
                        <Button
                            variant="ghost"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-[#0071E3] hover:text-[#0077ED] hover:bg-blue-50/50 font-medium transition-all text-sm rounded-xl py-6"
                        >
                            {showAll ? "הצג פחות" : `הצג עוד ${averages.length - 5} אוניברסיטאות`}
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Conversion Button */}
            <div className="p-4 pt-0 flex justify-center pb-6">
                <Button
                    onClick={() => window.open('https://chat.whatsapp.com/F3Kc5oNu2o46YNdGHxHTYm', '_blank')}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 px-6 rounded-full shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm w-full sm:w-auto"
                >
                    <MessageCircle className="h-5 w-5" />
                    <div className="flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-1">
                        <span className="opacity-90 font-normal">מבולבל? בא להתייעץ ב</span>
                        <span className="font-bold">קבוצה הווצאפ השקטה</span>
                    </div>
                </Button>
            </div>
        </Card>
    );
};
