require('dotenv').config();
const express = require('express');
const cors = require('cors');
const portfolioData = require('./data/portfolio.json');
const stockService = require('./services/stockService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function transformPortfolioData(rawData) {
    const stocks = rawData.filter(row =>
        row.__EMPTY &&
        typeof row.__EMPTY === 'number' &&
        row.__EMPTY_6 &&
        row.__EMPTY_1 !== 'Particulars'
    );

    return stocks.map(row => ({
        id: row.__EMPTY,
        name: row.__EMPTY_1,
        purchasePrice: row.__EMPTY_2 || 0,
        quantity: row.__EMPTY_3 || 0,
        investment: row.__EMPTY_4 || 0,
        portfolioPercent: (row.__EMPTY_5 || 0) * 100,
        symbol: row.__EMPTY_6,
        cmp: row.__EMPTY_7 || 0,
        presentValue: row.__EMPTY_8 || 0,
        gainLoss: row.__EMPTY_9 || 0,
        gainLossPercent: (row.__EMPTY_10 || 0) * 100,
        marketCap: row.__EMPTY_11 || 0,
        peRatio: row.__EMPTY_12 || 0,
        latestEarnings: row.__EMPTY_13 || 0,
        sector: determineSector(row.__EMPTY)
    }));
}

function determineSector(id) {
    if (id >= 1 && id <= 5) return 'Financial';
    if (id >= 1 && id <= 6) return 'Technology';
    if (id >= 1 && id <= 3) return 'Consumer';
    if (id >= 1 && id <= 4) return 'Power';
    if (id >= 1 && id <= 3) return 'Pipe';
    return 'Others';
}

function getSectorForStock(name) {
    const financialKeywords = ['Bank', 'Finance', 'Housing', 'Financials'];
    const techKeywords = ['Tech', 'Mindtree', 'Affle', 'KPIT', 'Tata Tech', 'BLS', 'Tanla'];
    const consumerKeywords = ['Dmart', 'Consumer', 'Pidilite'];
    const powerKeywords = ['Power', 'Green', 'Suzlon', 'Gensol'];
    const pipeKeywords = ['Pipes', 'Astral', 'Polycab'];

    if (financialKeywords.some(keyword => name.includes(keyword))) return 'Financial';
    if (techKeywords.some(keyword => name.includes(keyword))) return 'Technology';
    if (consumerKeywords.some(keyword => name.includes(keyword))) return 'Consumer';
    if (powerKeywords.some(keyword => name.includes(keyword))) return 'Power';
    if (pipeKeywords.some(keyword => name.includes(keyword))) return 'Pipe';

    return 'Others';
}

app.get('/api/portfolio', (req, res) => {
    try {
        const transformedData = transformPortfolioData(portfolioData);
        const dataWithSectors = transformedData.map(stock => ({
            ...stock,
            sector: getSectorForStock(stock.name)
        }));

        res.json({ success: true, data: dataWithSectors });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch portfolio data' });
    }
});

app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const [cmp, metrics] = await Promise.all([
            stockService.getCMP(symbol),
            stockService.getFinancialMetrics(symbol)
        ]);

        res.json({
            success: true,
            data: { symbol, cmp, ...metrics }
        });
    } catch (error) {
        console.error(`Error fetching stock data for ${req.params.symbol}:`, error);
        res.status(500).json({ success: false, error: 'Failed to fetch stock data' });
    }
});

app.post('/api/stocks/batch', async (req, res) => {
    try {
        const { symbols } = req.body;
        if (!symbols || !Array.isArray(symbols)) {
            return res.status(400).json({ success: false, error: 'symbols array is required' });
        }

        const stockData = await stockService.getBatchStockData(symbols);
        res.json({ success: true, data: stockData });
    } catch (error) {
        console.error('Error fetching batch stock data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch batch stock data' });
    }
});

app.get('/api/portfolio/live', async (req, res) => {
    try {
        const transformedData = transformPortfolioData(portfolioData);
        const dataWithSectors = transformedData.map(stock => ({
            ...stock,
            sector: getSectorForStock(stock.name)
        }));

        const symbols = dataWithSectors.map(stock => stock.symbol);
        const liveData = await stockService.getBatchStockData(symbols);

        const enrichedData = dataWithSectors.map(stock => {
            const live = liveData[stock.symbol] || {};
            const cmp = live.cmp || stock.cmp;
            const presentValue = cmp * stock.quantity;
            const gainLoss = presentValue - stock.investment;
            const gainLossPercent = stock.investment > 0 ? (gainLoss / stock.investment) * 100 : 0;

            return {
                ...stock,
                cmp,
                presentValue,
                gainLoss,
                gainLossPercent,
                peRatio: live.peRatio || stock.peRatio,
                latestEarnings: live.latestEarnings || stock.latestEarnings,
                marketCap: live.marketCap || stock.marketCap
            };
        });

        const sectorSummaries = calculateSectorSummaries(enrichedData);

        res.json({
            success: true,
            data: {
                stocks: enrichedData,
                sectorSummaries,
                totalInvestment: enrichedData.reduce((sum, stock) => sum + stock.investment, 0),
                totalPresentValue: enrichedData.reduce((sum, stock) => sum + stock.presentValue, 0),
                totalGainLoss: enrichedData.reduce((sum, stock) => sum + stock.gainLoss, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching live portfolio:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch live portfolio data' });
    }
});

function calculateSectorSummaries(stocks) {
    const sectors = {};

    stocks.forEach(stock => {
        if (!sectors[stock.sector]) {
            sectors[stock.sector] = {
                sector: stock.sector,
                totalInvestment: 0,
                totalPresentValue: 0,
                totalGainLoss: 0,
                stockCount: 0
            };
        }

        sectors[stock.sector].totalInvestment += stock.investment;
        sectors[stock.sector].totalPresentValue += stock.presentValue;
        sectors[stock.sector].totalGainLoss += stock.gainLoss;
        sectors[stock.sector].stockCount += 1;
    });

    return Object.values(sectors).map(sector => ({
        ...sector,
        gainLossPercent: sector.totalInvestment > 0
            ? (sector.totalGainLoss / sector.totalInvestment) * 100
            : 0
    }));
}

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/** Catch-all 404: return JSON so Express never sends its default HTML error page (which sets CSP default-src 'none' and triggers extension/console errors). */
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Portfolio Backend Server running on port ${PORT}`);
});

module.exports = app;
