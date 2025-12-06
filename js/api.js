// ============================================
// Multi-Asset Trading Analyzer - API & Data Management
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
 * Fetch current asset price from API or generate demo data
 * @param {String} asset - Asset symbol (e.g., 'XAUUSD', 'BTCUSD')
 * @returns {Promise<Object>} Price data {price, change, changePercent}
 */
async function fetchAssetPrice(asset = 'XAUUSD') {
    const assetConfig = getAssetConfig(asset);

    if (API_CONFIG.isDemoMode || !API_CONFIG.alphaVantageKey) {
        return generateDemoPrice(asset);
    }

    try {
        // Handle different asset types
        if (assetConfig.category === 'Crypto') {
            return await fetchCryptoPrice(asset);
        } else if (assetConfig.category === 'Forex') {
            return await fetchForexPrice(asset);
        } else if (assetConfig.category === 'Volatility') {
            // Volatility indices are demo-only (broker-specific)
            return generateDemoPrice(asset);
        }
    } catch (error) {
        console.error('Error fetching price data:', error);
        return generateDemoPrice(asset);
    }
}

/**
 * Fetch cryptocurrency price from CoinGecko API (free, no key required)
 * @param {String} asset - Crypto asset symbol
 * @returns {Promise<Object>} Price data
 */
async function fetchCryptoPrice(asset) {
    try {
        // Map asset symbols to CoinGecko IDs
        const coinMap = {
            'BTCUSD': 'bitcoin',
            'ETHUSD': 'ethereum',
            'XRPUSD': 'ripple',
            'LTCUSD': 'litecoin',
            'ADAUSD': 'cardano',
            'SOLUSD': 'solana',
            'DOGEUSD': 'dogecoin'
        };

        const coinId = coinMap[asset];
        if (!coinId) return generateDemoPrice(asset);

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
        const response = await fetch(url);
        const data = await response.json();

        if (data[coinId]) {
            const price = data[coinId].usd;
            const changePercent = data[coinId].usd_24h_change || 0;
            const change = (price * changePercent) / 100;

            return {
                price: price.toFixed(2),
                change: change.toFixed(2),
                changePercent: changePercent.toFixed(2)
            };
        }

        return generateDemoPrice(asset);
    } catch (error) {
        console.error('Error fetching crypto price:', error);
        return generateDemoPrice(asset);
    }
}

/**
 * Fetch forex pair price from Alpha Vantage
 * @param {String} asset - Forex asset symbol
 * @returns {Promise<Object>} Price data
 */
async function fetchForexPrice(asset) {
    try {
        // Parse forex pair (e.g., EURUSD -> EUR, USD)
        let fromCurrency, toCurrency;

        if (asset === 'XAUUSD') {
            fromCurrency = 'XAU';
            toCurrency = 'USD';
        } else {
            fromCurrency = asset.substring(0, 3);
            toCurrency = asset.substring(3, 6);
        }

        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_CONFIG.alphaVantageKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data['Realtime Currency Exchange Rate']) {
            const rate = data['Realtime Currency Exchange Rate'];
            let price = parseFloat(rate['5. Exchange Rate']);

            // For gold, multiply by 1000 to get price per ounce
            if (asset === 'XAUUSD') {
                price *= 1000;
            }

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
            return generateDemoPrice(asset);
        }
    } catch (error) {
        console.error('Error fetching forex price:', error);
        return generateDemoPrice(asset);
    }
}

// Keep old function name for backward compatibility
async function fetchXAUUSDPrice() {
    return fetchAssetPrice('XAUUSD');
}

/**
 * Generate realistic demo/simulated price data for any asset
 * @param {String} asset - Asset symbol
 * @returns {Object} Simulated price data
 */
function generateDemoPrice(asset = 'XAUUSD') {
    const assetConfig = getAssetConfig(asset);
    const basePrice = assetConfig.basePrice;
    const volatility = assetConfig.volatility;

    // Use a sine wave with random noise for realistic price movement
    const time = Date.now() / 100000;
    const trend = Math.sin(time) * volatility;
    const noise = (Math.random() - 0.5) * 10;
    const price = basePrice + trend + noise;

    // Calculate change from previous price
    const prevPrice = marketData.currentPrice || price;
    const change = price - prevPrice;
    const changePercent = (change / prevPrice) * 100;

    const decimals = assetConfig.decimals;

    return {
        price: price.toFixed(decimals),
        change: change.toFixed(decimals),
        changePercent: changePercent.toFixed(2)
    };
}

/**
 * Fetch historical candle data for technical analysis
 * @param {String} timeframe - Timeframe (M5, M15, H1, H4, D1)
 * @param {Number} limit - Number of candles to fetch
 * @returns {Promise<Array>} Array of OHLC candles
 */
async function fetchHistoricalData(timeframe = 'H4', limit = 200, asset = 'XAUUSD') {
    if (API_CONFIG.isDemoMode || !API_CONFIG.alphaVantageKey) {
        return generateDemoCandles(limit, asset);
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
            return generateDemoCandles(limit, asset);
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
 * Generate realistic demo candle data for any asset
 * @param {Number} count - Number of candles to generate
 * @param {String} asset - Asset symbol
 * @returns {Array} Array of OHLC candles
 */
function generateDemoCandles(count = 200, asset = 'XAUUSD') {
    const assetConfig = getAssetConfig(asset);
    const candles = [];
    const basePrice = assetConfig.basePrice;
    let currentPrice = basePrice;
    const now = Date.now();
    const interval = 4 * 60 * 60 * 1000; // 4 hours
    const volatility = assetConfig.volatility;

    for (let i = count - 1; i >= 0; i--) {
        const time = now - (i * interval);

        // Random walk with mean reversion
        const change = (Math.random() - 0.48) * volatility; // Slight upward bias
        currentPrice += change;

        // Mean reversion
        const meanReversionRange = volatility * 3;
        if (currentPrice > basePrice + meanReversionRange) currentPrice -= volatility * 0.25;
        if (currentPrice < basePrice - meanReversionRange) currentPrice += volatility * 0.25;

        const open = currentPrice;
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);

        candles.push({
            time,
            open: parseFloat(open.toFixed(assetConfig.decimals)),
            high: parseFloat(high.toFixed(assetConfig.decimals)),
            low: parseFloat(low.toFixed(assetConfig.decimals)),
            close: parseFloat(close.toFixed(assetConfig.decimals))
        });

        currentPrice = close;
    }

    return candles;
}

/**
 * Update market data cache with latest information
 * @param {String} timeframe - Current timeframe
 */
async function updateMarketData(timeframe = 'H4', asset = 'XAUUSD') {
    try {
        // Fetch current price
        const priceData = await fetchAssetPrice(asset);
        marketData.currentPrice = parseFloat(priceData.price);
        marketData.priceChange = parseFloat(priceData.change);
        marketData.priceChangePercent = parseFloat(priceData.changePercent);

        // Fetch historical candles
        const candles = await fetchHistoricalData(timeframe, 200, asset);
        marketData.candles = candles;
        marketData.lastUpdate = new Date();

        console.log('📈 Market data updated:', {
            asset,
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
