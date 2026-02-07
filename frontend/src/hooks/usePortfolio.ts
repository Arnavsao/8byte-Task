import { useState, useEffect, useCallback } from 'react';
import { getLivePortfolio } from '@/services/api';
import { PortfolioData } from '@/types/portfolio';

export function usePortfolio(refreshInterval: number = 30000) {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const portfolioData = await getLivePortfolio();
            setData(portfolioData);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Portfolio fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchData, refreshInterval]);

    return {
        data,
        loading,
        error,
        lastUpdate,
        refetch: fetchData,
    };
}
