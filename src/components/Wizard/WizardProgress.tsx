import { Check } from 'lucide-react';

interface WizardProgressProps {
    currentStep: number;
    steps: string[];
    onStepClick: (index: number) => void;
}

export function WizardProgress({ currentStep, steps, onStepClick }: WizardProgressProps) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative z-10">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isClickable = index <= currentStep + 1; // Can navigate to previous, current, or next step

                    return (
                        <div
                            key={index}
                            className={`flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                            onClick={() => isClickable && onStepClick(index)}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-blue-600 border-blue-600 text-white group-hover:bg-blue-700'
                                        : isCurrent
                                            ? 'bg-white border-blue-600 text-blue-600 scale-110 shadow-lg'
                                            : 'bg-white border-gray-300 text-gray-300 group-hover:border-gray-400'
                                    }`}
                            >
                                {isCompleted ? <Check className="w-6 h-6" /> : <span className="font-bold">{index + 1}</span>}
                            </div>
                            <span className={`mt-2 text-sm font-medium transition-colors ${isCurrent ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar Background */}
            <div className="absolute top-9 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" />

            {/* Active Progress Bar - simplified calculation for demo */}
            <div
                className="absolute top-9 left-0 h-0.5 bg-blue-600 -z-0 transition-all duration-500 hidden md:block"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
        </div>
    );
}
