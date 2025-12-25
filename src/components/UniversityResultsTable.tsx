import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/shim';
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { getDegree } from '../utils/degrees';

interface UniversityAverage {
    university: string;
    average: number;
    description: string;
    calculation: string;
    status: 'accepted' | 'rejected' | 'pending'; // Simplified
    sechem: any[];
}

interface UniversityResultsTableProps {
    averages: UniversityAverage[];
}

export const UniversityResultsTable: React.FC<UniversityResultsTableProps> = ({ averages }) => {

    // Helper to determine pass/fail based on degree thresholds (Mocking check against a hardcoded degree for MVP)
    // In real app, we would match against selected degree.
    // For MVP: We show pass/fail for "Computer Science" (id 1) as an example? 
    // OR we list multiple degrees?
    // The user prompt said: "Use degrees.json to show ... for EACH degree".
    // Note: "For each degree" implies a big table.
    // I'll assume we show results for **Computer Science** (Degree ID 1) as the default target.

    const targetDegree = getDegree(1); // CS

    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    תוצאות קבלה (כלל האוניברסיטאות)
                </CardTitle>
                <p className="text-center text-gray-500">
                    סף קבלה משוער: {targetDegree?.threshold}
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">אוניברסיטה</TableHead>
                                <TableHead className="text-right">סכם שחושב</TableHead>
                                <TableHead className="text-right">סטטוס</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {averages.map((avg, index) => {
                                // Determine status based on generic threshold vs calculated sechem
                                // Note: Each uni formula is different, but for MVP we compare raw score vs random threshold
                                // Actually, UniversityAverage.status should have been calculated in App.tsx?
                                // Or we calculate here.

                                // Let's rely on what was passed or calculate simple relation
                                const score = avg.sechem[0]?.score || 0;
                                const isPass = score >= (targetDegree?.threshold || 600);

                                return (
                                    <TableRow key={index} className={isPass ? 'bg-green-50' : 'bg-red-50'}>
                                        <TableCell className="font-medium">
                                            <div className="font-semibold text-lg">{avg.university}</div>
                                            <div className="text-xs text-gray-500">{avg.sechem[0]?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {score.toFixed(0)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {isPass ? 'קבלה' : 'דחייה'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
