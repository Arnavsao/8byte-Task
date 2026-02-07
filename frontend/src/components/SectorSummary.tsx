import { memo } from 'react';
import { SectorSummary } from '@/types/portfolio';

interface SectorSummaryProps {
    summaries: SectorSummary[];
}

function SectorSummaryComponent({ summaries }: SectorSummaryProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {summaries.map((summary) => (
                <div
                    key={summary.sector}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {summary.sector}
                        </h3>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-medium">
                            {summary.stockCount}
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        <div>
                            <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wide">Investment</p>
                            <p className="text-sm font-semibold text-slate-100 number-cell">
                                {formatCurrency(summary.totalInvestment)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wide">Present Value</p>
                            <p className="text-sm font-semibold text-slate-100 number-cell">
                                {formatCurrency(summary.totalPresentValue)}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Gain/Loss</p>
                            <div className="flex items-baseline gap-2">
                                <p className={`text-base font-bold number-cell ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(summary.totalGainLoss)}
                                </p>
                                <span className={`text-xs font-semibold ${summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatPercent(summary.gainLossPercent)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default memo(SectorSummaryComponent);
