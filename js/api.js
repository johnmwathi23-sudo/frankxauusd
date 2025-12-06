// ============================================
// XAUUSD Trading Analyzer - API & Data Management
// Handles real-time data fetching and demo mode
// ============================================

// Configuration
const API_CONFIG = {
    alphaVantageKey: localStorage.getItem('alphaVantageKey') || '',
    newsApiKey: localStorage.getItem('newsApiKey') || '',
    updateInterval: 60000, // 60 seconds
    isDemoMode: true // Start in demo mode by default
};

// Market data cache
let marketData = {
    currentPrice: null,
    priceChange: null,
    priceChangePercent: null,
    candles: [],
    lastUpdate: null
};

/**
 * Fetch current XAUUSD price from API or generate demo data
 * @returns {Promise<Object>} Price data {price, change, changePercent}
 */
async function fetchXAUUSDPrice() {
    if (API_CONFIG.isDemoMode || !API_CONFIG.alphaVantageKey) {
        return generateDemoPrice();
    }

    try {
        // Alpha Vantage API endpoint for gold (XAUUSD)
        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_CONFIG.alphaVantageKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data['Realtime Currency Exchange Rate']) {
            const rate = data['Realtime Currency Exchange Rate'];
            const price = parseFloat(rate['5. Exchange Rate']) * 1000; // Convert to price per ounce

            // Calculate change (simplified - would need historical data for accurate calculation)
            const prevPrice = marketData.currentPrice || price;
            const change = price - prevPrice;
            const changePercent = (change / prevPrice) * 100;

            return {
                price: price.toFixed(2),
                change: change.toFixed(2),
                changePercent: changePercent.toFixed(2)
            };
        } else {
            console.warn('Alpha Vantage API limit reached or error, switching to demo mode');
            API_CONFIG.isDemoMode = true;
            return generateDemoPrice();
        }
    } catch (error) {
        console.error('Error fetching price data:', error);
        return generateDemoPrice();
    }
}

/**
 * Generate realistic demo/simulated XAUUSD price data
 * @returns {Object} Simulated price data
 */
function generateDemoPrice() {
    // Base price around current gold prices (Dec 2025)
    const basePrice = 2050;
    const volatility = 20;

    // Use a sine wave with random noise for realistic price movement
    const time = Date.now() / 100000;
    const trend = Math.sin(time) * volatility;
    const noise = (Math.random() - 0.5) * 10;
    const price = basePrice + trend + noise;

    // Calculate change from previous price
    const prevPrice = marketData.currentPrice || price;
    const change = price - prevPrice;
    const changePercent = (change / prevPrice) * 100;

    return {
        price: price.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2)
    };
}

/**
 * Fetch historical candle data for technical analysis
 * @param {String} timeframe - Timeframe (M5, M15, H1, H4, D1)
 * @param {Number} limit - Number of candles to fetch
 * @returns {Promise<Array>} Array of OHLC candles
 */
async function fetchHistoricalData(timeframe = 'H4', limit = 200) {
    if (API_CONFIG.isDemoMode || !API_CONFIG.alphaVantageKey) {
        return generateDemoCandles(limit);
    }

    try {
        // Map timeframe to Alpha Vantage interval
        const intervalMap = {
            'M5': '5min',
            'M15': '15min',
            'H1': '60min',
            'H4': '60min', // Will need to aggregate
            'D1': 'daily'
        };

        const interval = intervalMap[timeframe] || '60min';
        const functionType = timeframe === 'D1' ? 'FX_DAILY' : 'FX_INTRADAY';

        const url = `https://www.alphavantage.co/query?function=${functionType}&from_symbol=XAU&to_symbol=USD&interval=${interval}&apikey=${API_CONFIG.alphaVantageKey}`;

        const response = await fetch(url);
        const data = await response.json();

        // Parse and format candle data
        const timeSeries = data[`Time Series FX (${interval})`] || data['Time Series FX (Daily)'];

        if (!timeSeries) {
            console.warn('No time series data, using demo candles');
            return generateDemoCandles(limit);
        }

        const candles = Object.entries(timeSeries).slice(0, limit).map(([time, values]) => ({
            time: new Date(time).getTime(),
            open: parseFloat(values['1. open']) * 1000,
            high: parseFloat(values['2. high']) * 1000,
            low: parseFloat(values['3. low']) * 1000,
            close: parseFloat(values['4. close']) * 1000
        })).reverse();

        return candles;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return generateDemoCandles(limit);
    }
}

/**
 * Generate realistic demo candle data
 * @param {Number} count - Number of candles to generate
 * @returns {Array} Array of OHLC candles
 */
function generateDemoCandles(count = 200) {
    const candles = [];
    const basePrice = 2050;
    let currentPrice = basePrice;
    const now = Date.now();
    const interval = 4 * 60 * 60 * 1000; // 4 hours

    for (let i = count - 1; i >= 0; i--) {
        const time = now - (i * interval);
        const volatility = 15;

        // Random walk with mean reversion
        const change = (Math.random() - 0.48) * volatility; // Slight upward bias
        currentPrice += change;

        // Mean reversion
        if (currentPrice > basePrice + 50) currentPrice -= 5;
        if (currentPrice < basePrice - 50) currentPrice += 5;

        const open = currentPrice;
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);

        candles.push({
            time,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });

        currentPrice = close;
    }

    return candles;
}

/**
 * Update market data cache with latest information
 * @param {String} timeframe - Current timeframe
 */
async function updateMarketData(timeframe = 'H4') {
    try {
        // Fetch current price
        const priceData = await fetchXAUUSDPrice();
        marketData.currentPrice = parseFloat(priceData.price);
        marketData.priceChange = parseFloat(priceData.change);
        marketData.priceChangePercent = parseFloat(priceData.changePercent);

        // Fetch historical candles
        const candles = await fetchHistoricalData(timeframe, 200);
        marketData.candles = candles;
        marketData.lastUpdate = new Date();

        console.log('📈 Market data updated:', {
            price: marketData.currentPrice,
            change: marketData.priceChange,
            candleCount: candles.length,
            timeframe
        });

        return marketData;
    } catch (error) {
        console.error('Error updating market data:', error);
        throw error;
    }
}

/**
 * Get current market data from cache
 * @returns {Object} Current market data
 */
function getMarketData() {
    return marketData;
}

/**
 * Toggle between demo mode and live mode
 * @param {Boolean} isDemoMode - Whether to use demo mode
 */
function setDemoMode(isDemoMode) {
    API_CONFIG.isDemoMode = isDemoMode;
    console.log(`Mode switched to: ${isDemoMode ? 'DEMO' : 'LIVE'}`);
}

/**
 * Get current mode
 * @returns {Boolean} True if demo mode, false if live
 */
function isDemoMode() {
    return API_CONFIG.isDemoMode;
}

/**
 * Update API keys
 * @param {String} alphaVantageKey - Alpha Vantage API key
 * @param {String} newsApiKey - News API key
 */
function updateApiKeys(alphaVantageKey, newsApiKey) {
    if (alphaVantageKey) {
        API_CONFIG.alphaVantageKey = alphaVantageKey;
        localStorage.setItem('alphaVantageKey', alphaVantageKey);
    }
    if (newsApiKey) {
        API_CONFIG.newsApiKey = newsApiKey;
        localStorage.setItem('newsApiKey', newsApiKey);
    }
    console.log('✅ API keys updated');
}

/**
 * Get API configuration
 * @returns {Object} Current API config
 */
function getApiConfig() {
    return { ...API_CONFIG };
}

/**
 * Auto-refresh mechanism - call update function at regular intervals
 * @param {Function} updateCallback - Function to call on each update
 * @returns {Number} Interval ID
 */
function startAutoRefresh(updateCallback) {
    // Initial update
    updateCallback();

    // Set up interval
    const intervalId = setInterval(updateCallback, API_CONFIG.updateInterval);
    console.log(`🔄 Auto-refresh started (every ${API_CONFIG.updateInterval / 1000}s)`);

    return intervalId;
}

/**
 * Stop auto-refresh
 * @param {Number} intervalId - Interval ID to clear
 */
function stopAutoRefresh(intervalId) {
    clearInterval(intervalId);
    console.log('⏹️ Auto-refresh stopped');
}
