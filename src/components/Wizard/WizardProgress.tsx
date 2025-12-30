import { Check } from 'lucide-react';

interface WizardProgressProps {
    currentStep: number;
    steps: string[];
    onStepClick: (index: number) => void;
}

export function WizardProgress({ currentStep, steps, onStepClick }: WizardProgressProps) {
    return (
        <div className="w-full relative px-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0 translate-y-[-50%]" />

            {/* Active Line - approximated */}
            <div
                className="absolute top-1/2 right-0 h-0.5 bg-[#0071E3] -z-0 translate-y-[-50%] transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            <div className="flex items-center justify-between relative z-10 w-full">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isClickable = index <= currentStep + 1;

                    return (
                        <div
                            key={index}
                            className={`flex flex-col items-center group relative ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => isClickable && onStepClick(index)}
                        >
                            <div
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-sm
                                    ${isCompleted ? 'bg-[#0071E3] text-white' :
                                        isCurrent ? 'bg-[#0071E3] text-white ring-2 ring-[#0071E3]/20 scale-110' :
                                            'bg-gray-100 text-gray-400'}`}
                            >
                                {isCompleted ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <span className="font-semibold text-[10px] md:text-xs">{index + 1}</span>}
                            </div>

                            <span className={`absolute -bottom-5 whitespace-nowrap text-[10px] md:text-xs font-medium transition-all duration-300 ${isCurrent ? 'text-[#0071E3] opacity-100 transform translate-y-0' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Spacer for the text labels that pop up */}
            <div className="h-3"></div>
        </div>
    );
}
