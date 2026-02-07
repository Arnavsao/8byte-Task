'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-6 text-slate-400 text-center text-sm font-medium">Loading portfolio data...</p>
            </div>
        </div>
    );
}
