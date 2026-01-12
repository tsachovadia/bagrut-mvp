import React, { useEffect, useState } from 'react';
import { admissionEngine, type University, type Program, type ExamEvent } from '../../services/admission-engine';
import { smartRecommendationEngine, type Recommendation } from '../../services/smart-recommendation';
import { SmartInsightsWidget } from '../SmartInsightsWidget';
import type { SubjectGrade } from '../../utils/calculator';

export const ProgramsDatabaseViewer: React.FC = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [selectedUni, setSelectedUni] = useState<string | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [schedule, setSchedule] = useState<ExamEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedUni) {
            loadPrograms(selectedUni);
        }
    }, [selectedUni]);

    const loadInitialData = async () => {
        const unis = await admissionEngine.getAllUniversities();
        const exams = await admissionEngine.getExamSchedule();
        setUniversities(unis);
        setSchedule(exams);
        setLoading(false);
    };

    const loadPrograms = async (uniId: string) => {
        const progs = await admissionEngine.getProgramsForUniversity(uniId);
        setPrograms(progs);
    };

    const [simulating, setSimulating] = useState(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    const handleSimulate = async () => {
        setSimulating(true);
        // Mock Student Profile
        const mockGrades: SubjectGrade[] = [
            { id: '1', subject: 'מתמטיקה', units: 4, grade: 80 },
            { id: '2', subject: 'אנגלית', units: 5, grade: 85 },
            { id: '3', subject: 'תנ״ך', units: 2, grade: 90 },
            { id: '4', subject: 'היסטוריה', units: 2, grade: 88 },
            { id: '5', subject: 'עברית', units: 2, grade: 85 },
        ];
        const mockPsychometric = 680;

        // Run Engine
        const recs = await smartRecommendationEngine.generateRecommendations(mockGrades, mockPsychometric);
        setRecommendations(recs);
        setSimulating(false);
    };

    if (loading) return <div className="p-4">Loading Admission Engine...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-900 font-sans" dir="ltr">
            <h1 className="text-2xl font-bold mb-4 text-blue-800">🕵️ Admission Engine Debugger (Safe Mode)</h1>

            {/* Simulation Control Panel */}
            <div className="bg-white p-4 rounded shadow mb-6 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg">Smart Insights Simulation</h2>
                    <p className="text-sm text-gray-500">Run the engine with mock profile (Math 4u/80, Eng 5u/85, Psycho 680)</p>
                </div>
                <button
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {simulating ? 'Analyzing...' : '🤖 Run Simulation'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Browser */}
                <div className="space-y-6 lg:col-span-1">
                    <section className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-bold mb-2">1. Universities (from DB)</h2>
                        <div className="flex flex-wrap gap-2">
                            {universities.map(uni => (
                                <button
                                    key={uni.id}
                                    onClick={() => setSelectedUni(uni.id)}
                                    className={`px-3 py-1 rounded border ${selectedUni === uni.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                                >
                                    {uni.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {selectedUni && (
                        <section className="bg-white p-4 rounded shadow">
                            <h2 className="text-xl font-bold mb-2">2. Programs & Rules</h2>
                            {programs.length === 0 ? <p>No programs found.</p> : (
                                <div className="space-y-3">
                                    {programs.map(prog => (
                                        <div key={prog.id} className="border p-3 rounded hover:bg-gray-50">
                                            <div className="flex justify-between font-semibold">
                                                <span>{prog.name} ({prog.degree_type})</span>
                                                <span className="text-sm text-gray-500">{prog.duration_years}y</span>
                                            </div>

                                            {prog.admission_rules?.map(rule => (
                                                <div key={rule.year} className="mt-2 text-sm bg-blue-50 p-2 rounded">
                                                    <div className="font-mono text-xs text-blue-600">RULESET {rule.year}</div>
                                                    <div>Min Score: <b>{rule.min_score || 'N/A'}</b></div>
                                                    <div>Operator: <b>{rule.logic_operator || 'N/A'}</b></div>
                                                    {rule.raw_json && (
                                                        <pre className="text-xs text-gray-600 mt-1">{JSON.stringify(rule.raw_json, null, 2)}</pre>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Middle Col: Schedule */}
                <div className="space-y-6 lg:col-span-1">
                    <section className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-bold mb-2">3. Exam Schedule (Temporal Engine)</h2>
                        <div className="overflow-auto max-h-[600px]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.map((exam, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2 font-mono">{new Date(exam.exam_date).toLocaleDateString()}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-0.5 rounded text-xs ${exam.exam_type === 'psychometric' ? 'bg-purple-100 text-purple-800' :
                                                    exam.exam_type === 'bagrut' ? 'bg-green-100 text-green-800' :
                                                        'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {exam.exam_type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                {exam.season}
                                                {exam.subject && <div className="text-gray-500 text-xs">{exam.subject}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Col: Smart Insights Results */}
                <div className="space-y-6 lg:col-span-1">
                    <section className="bg-white p-4 rounded shadow min-h-[400px]">
                        <h2 className="text-xl font-bold mb-4">4. Live Recommendations</h2>
                        {recommendations.length > 0 || simulating ? (
                            <SmartInsightsWidget
                                recommendations={recommendations}
                                isLoading={simulating}
                            />
                        ) : (
                            <div className="text-center text-gray-400 py-10">
                                Click "Run Simulation" to generate insights based on DB schedule and mock logic.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
