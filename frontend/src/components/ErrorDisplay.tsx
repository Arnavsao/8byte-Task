'use client';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-base font-semibold text-red-500">Error</h3>
                </div>
                <p className="text-slate-100 mb-5 text-sm">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
