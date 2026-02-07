import axios from 'axios';
import { PortfolioData, Stock, APIResponse } from '@/types/portfolio';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'; // Updated to match backend port

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug('[api] Using API base URL:', API_BASE_URL);
}

export async function getPortfolio(): Promise<Stock[]> {
    try {
        const response = await api.get<APIResponse<Stock[]>>('/api/portfolio');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        throw new Error('Failed to fetch portfolio data');
    }
}

export async function getLivePortfolio(): Promise<PortfolioData> {
    try {
        const response = await api.get<APIResponse<PortfolioData>>('/api/portfolio/live');
        return response.data.data;
    } catch (error) {
        const url = `${API_BASE_URL}/api/portfolio/live`;

        if (axios.isAxiosError(error)) {
            console.error('[api] Axios error fetching live portfolio:', {
                url,
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
            });
        } else if (error instanceof Error) {
            console.error('[api] Error fetching live portfolio:', {
                url,
                message: error.message,
                stack: error.stack,
            });
        } else {
            console.error('[api] Unknown error fetching live portfolio:', {
                url,
                error: String(error),
            });
        }

        throw new Error('Failed to fetch live portfolio data');
    }
}

export async function getStock(symbol: string) {
    try {
        const response = await api.get(`/api/stock/${symbol}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching stock ${symbol}:`, error);
        throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
}

export async function getBatchStocks(symbols: string[]) {
    try {
        const response = await api.post('/api/stocks/batch', { symbols });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching batch stocks:', error);
        throw new Error('Failed to fetch batch stock data');
    }
}
