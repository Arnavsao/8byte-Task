export interface Stock {
    id: number;
    name: string;
    purchasePrice: number;
    quantity: number;
    investment: number;
    portfolioPercent: number;
    symbol: string;
    cmp: number;
    presentValue: number;
    gainLoss: number;
    gainLossPercent: number;
    marketCap: number;
    peRatio: number;
    latestEarnings: number;
    sector: string;
}

export interface SectorSummary {
    sector: string;
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
    gainLossPercent: number;
    stockCount: number;
}

export interface PortfolioData {
    stocks: Stock[];
    sectorSummaries: SectorSummary[];
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
}

export interface APIResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}
