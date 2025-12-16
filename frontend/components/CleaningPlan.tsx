import React from 'react';
import { X, Play, AlertCircle } from 'lucide-react';

interface PlanStep {
    action: string;
    params: any;
    reasoning: string;
}

interface CleaningPlanProps {
    plan: PlanStep[];
    onApply: () => void;
    onRemoveStep: (index: number) => void;
    loading: boolean;
}

export function CleaningPlan({ plan, onApply, onRemoveStep, loading }: CleaningPlanProps) {
    if (!plan || plan.length === 0) {
        return <div className="p-4 text-center text-gray-500">No cleaning steps needed!</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Proposed Cleaning Plan</h3>
                <button
                    onClick={onApply}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                    {loading ? <span className="animate-spin">⌛</span> : <Play size={20} />}
                    Execute Plan
                </button>
            </div>

            <div className="space-y-3">
                {plan.map((step, index) => (
                    <div key={index} className="flex items-start justify-between bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 capitalize">{step.action.replace('_', ' ')}</h4>
                                <p className="text-sm text-gray-600 mt-1">{step.reasoning}</p>
                                <div className="mt-2 text-xs bg-gray-100 p-2 rounded text-gray-500 font-mono">
                                    Params: {JSON.stringify(step.params)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemoveStep(index)}
                            className="text-gray-400 hover:text-red-500 p-2"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3 mt-6">
                <AlertCircle className="text-yellow-600 mt-1" />
                <div>
                    <h5 className="font-semibold text-yellow-800">Review Changes</h5>
                    <p className="text-sm text-yellow-700">These actions will modify your dataset. A new version will be created, keeping your raw data safe.</p>
                </div>
            </div>
        </div>
    );
}
