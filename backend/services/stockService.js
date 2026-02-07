const axios = require('axios');
const cacheService = require('./cacheService');

let yahooFinance;
(async () => {
    try {
        // Dynamic import for ESM-only module
        const module = await import('yahoo-finance2');
        const YahooFinance = module.default;
        // Instantiate the class
        yahooFinance = new YahooFinance();
        // Suppress console warnings
        if (yahooFinance.suppressNotices) {
            yahooFinance.suppressNotices(['yahooSurvey']);
        }
    } catch (error) {
        console.warn('Yahoo Finance module not available, using mock data', error.message);
    }
})();

async function getCMP(symbol) {
    try {
        // Ensure symbol is a string
        const stockSymbol = String(symbol);
        const cacheKey = `cmp_${stockSymbol}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for ${stockSymbol}`);
            return cachedData;
        }

        console.log(`Fetching CMP for ${stockSymbol} from Yahoo Finance...`);

        // Handle BSE codes (numeric) and NSE symbols
        const yahooSymbol = stockSymbol.includes('.') ? stockSymbol :
            /^\d+$/.test(stockSymbol) ? `${stockSymbol}.BO` : `${stockSymbol}.NS`;

        const quote = await yahooFinance.quote(yahooSymbol);
        const cmp = quote.regularMarketPrice || quote.currentPrice || 0;

        cacheService.set(cacheKey, cmp, 15);
        return cmp;
    } catch (error) {
        console.error(`Error fetching CMP for ${symbol}:`, error.message);
        const cacheKey = `cmp_${symbol}`;
        // Try to return cached value even if expired in case of error
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const mockPrice = getMockPrice(symbol);
        // Cache mock data for shorter duration
        cacheService.set(cacheKey, mockPrice, 5);
        return mockPrice;
    }
}

async function getFinancialMetrics(symbol) {
    try {
        // Ensure symbol is a string
        const stockSymbol = String(symbol);
        const cacheKey = `metrics_${stockSymbol}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for metrics ${stockSymbol}`);
            return cachedData;
        }

        console.log(`Fetching financial metrics for ${stockSymbol}...`);

        // Handle BSE codes (numeric) and NSE symbols
        const yahooSymbol = stockSymbol.includes('.') ? stockSymbol :
            /^\d+$/.test(stockSymbol) ? `${stockSymbol}.BO` : `${stockSymbol}.NS`;

        const quote = await yahooFinance.quote(yahooSymbol);

        const metrics = {
            peRatio: quote.trailingPE || quote.forwardPE || 0,
            latestEarnings: quote.epsTrailingTwelveMonths || quote.epsCurrentYear || 0,
            marketCap: quote.marketCap || 0
        };

        cacheService.set(cacheKey, metrics, 60);
        return metrics;
    } catch (error) {
        console.error(`Error fetching metrics for ${symbol}:`, error.message);
        const cacheKey = `metrics_${symbol}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const mockMetrics = getMockMetrics();
        cacheService.set(cacheKey, mockMetrics, 60);
        return mockMetrics;
    }
}

function getMockPrice(symbol) {
    // Basic mock logic just to prevent crash
    const basePrice = 1000;
    const variation = (Math.random() - 0.5) * 0.05;
    return Math.round(basePrice * (1 + variation) * 100) / 100;
}

function getMockMetrics() {
    return {
        peRatio: Math.round((10 + Math.random() * 20) * 100) / 100,
        latestEarnings: Math.round((5 + Math.random() * 50) * 100) / 100,
        marketCap: Math.round((10000 + Math.random() * 50000) * 100) / 100
    };
}


async function getBatchStockData(symbols) {
    const results = {};

    // Process sequentially to be gentle on the API
    for (const symbol of symbols) {
        const stockSymbol = String(symbol);
        const cacheKey = `full_data_${stockSymbol}`;
        let data = cacheService.get(cacheKey);

        if (!data) {
            try {
                const yahooSymbol = stockSymbol.includes('.') ? stockSymbol :
                    /^\d+$/.test(stockSymbol) ? `${stockSymbol}.BO` : `${stockSymbol}.NS`;

                console.log(`Fetching data for ${stockSymbol}...`);
                const quote = await yahooFinance.quote(yahooSymbol);

                // Extract all needed data from the single quote
                data = {
                    symbol: stockSymbol,
                    cmp: quote.regularMarketPrice || quote.currentPrice || 0,
                    peRatio: quote.trailingPE || quote.forwardPE || 0,
                    latestEarnings: quote.epsTrailingTwelveMonths || quote.epsCurrentYear || 0,
                    marketCap: quote.marketCap || 0
                };

                // Cache for a good amount of time to avoid hitting limits on refresh
                cacheService.set(cacheKey, data, 120); // 2 minutes cache

                // Specific caches for individual endpoints if they are called later
                cacheService.set(`cmp_${stockSymbol}`, data.cmp, 120);
                cacheService.set(`metrics_${stockSymbol}`, {
                    peRatio: data.peRatio,
                    latestEarnings: data.latestEarnings,
                    marketCap: data.marketCap
                }, 120);

                // Add delay to prevent 429 Too Many Requests
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error fetching ${stockSymbol}: ${error.message}`);
                // Fallback to mock data
                data = {
                    symbol: stockSymbol,
                    cmp: getMockPrice(stockSymbol),
                    ...getMockMetrics()
                };
                // Cache mock data briefly so we don't retry immediately
                cacheService.set(cacheKey, data, 30);
            }
        } else {
            console.log(`Cache hit for ${stockSymbol}`);
        }

        results[stockSymbol] = data;
    }
    return results;
}

module.exports = {
    getCMP,
    getFinancialMetrics,
    getBatchStockData
};
