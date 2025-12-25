import { SCENARIOS } from '../utils/test-scenarios';

interface DebugToolsProps {
    onLoadScenario: (scenario: any) => void;
}

export const DebugTools = ({ onLoadScenario }: DebugToolsProps) => {
    return (
        <div className="bg-gray-800 text-white p-2 rounded-lg mb-6 flex flex-wrap gap-4 items-center justify-center text-sm">
            <span className="font-bold text-yellow-500 uppercase tracking-wider">Debug Tools:</span>
            {Object.values(SCENARIOS).map((scenario: any) => (
                <button
                    key={scenario.name}
                    onClick={() => onLoadScenario(scenario)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                >
                    {scenario.name}
                </button>
            ))}
        </div>
    );
};
