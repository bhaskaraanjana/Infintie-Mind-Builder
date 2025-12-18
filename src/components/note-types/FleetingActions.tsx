import React from 'react';
import { ArrowRightCircle, BookOpen } from 'lucide-react';

interface FleetingActionsProps {
    onConvertToPermanent: () => void;
    onConvertToLiterature: () => void;
}

export const FleetingActions: React.FC<FleetingActionsProps> = ({ onConvertToPermanent, onConvertToLiterature }) => {
    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
            <span className="text-xs text-neutral-400 font-medium mr-auto">Process Note:</span>

            <button
                onClick={onConvertToLiterature}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                title="Convert to Literature Note (Add Sources)"
            >
                <BookOpen size={14} /> To Literature
            </button>

            <button
                onClick={onConvertToPermanent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors shadow-sm"
                title="Convert to Permanent Note (Solidify Idea)"
            >
                <ArrowRightCircle size={14} /> To Permanent
            </button>
        </div>
    );
};
