'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import SectorSummary from '@/components/SectorSummary';
import PortfolioTable from '@/components/PortfolioTable';

export default function Home() {
  const { data, loading, error, lastUpdate, refetch } = usePortfolio(15000);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data) return <ErrorDisplay message={error} onRetry={refetch} />;
  if (!data) return <ErrorDisplay message="No portfolio data available" onRetry={refetch} />;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const percent = (value / data.totalInvestment) * 100;
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const gainLossPercent = (data.totalGainLoss / data.totalInvestment) * 100;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-100" >Portfolio Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}

              <button
                onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors text-sm font-medium border border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Investment</span>
            </div>
            <div className="text-2xl font-semibold text-slate-100 number-cell">
              {formatCurrency(data.totalInvestment)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Present Value</span>
            </div>
            <div className="text-2xl font-semibold text-slate-100 number-cell">
              {formatCurrency(data.totalPresentValue)}
            </div>
          </div>

          <div className={`${data.totalGainLoss >= 0 ? 'bg-green-950/30 border-green-900/50' : 'bg-red-950/30 border-red-900/50'} border rounded-lg p-5`}>
            <div className="mb-3">
              <span className={`text-xs font-medium uppercase tracking-wider ${data.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                Total Gain/Loss
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-2xl font-semibold number-cell ${data.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(data.totalGainLoss)}
              </span>
              <span className={`text-base font-medium ${data.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Sector Performance</h2>
          </div>
          <SectorSummary summaries={data.sectorSummaries} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Holdings</h2>
            <span className="text-xs text-slate-400 font-medium">
              {data.stocks.length} stocks
            </span>
          </div>
          <PortfolioTable stocks={data.stocks} />
        </div>
      </main>
    </div>
  );
}
