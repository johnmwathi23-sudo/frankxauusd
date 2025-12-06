// ============================================
// Multi-Asset Trading Analyzer - Asset Configuration
// Defines all supported trading instruments and their properties
// ============================================

/**
 * Asset configuration database
 * Contains metadata for all supported trading instruments
 */
const ASSET_CONFIG = {
    // ==================== FOREX PAIRS ====================
    'XAUUSD': {
        name: 'Gold vs US Dollar',
        displayName: 'XAU/USD',
        category: 'Forex',
        categoryColor: '#FFD700',
        basePrice: 2050,
        volatility: 20,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['gold', 'precious metals', 'XAU', 'bullion'],
        icon: '🥇',
        description: 'Gold spot price against US Dollar'
    },
    'EURUSD': {
        name: 'Euro vs US Dollar',
        displayName: 'EUR/USD',
        category: 'Forex',
        categoryColor: '#4A90E2',
        basePrice: 1.0850,
        volatility: 0.008,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['euro', 'EUR', 'ECB', 'European Central Bank'],
        icon: '💶',
        description: 'Euro against US Dollar'
    },
    'GBPUSD': {
        name: 'British Pound vs US Dollar',
        displayName: 'GBP/USD',
        category: 'Forex',
        categoryColor: '#E74C3C',
        basePrice: 1.2650,
        volatility: 0.010,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['pound', 'GBP', 'sterling', 'Bank of England'],
        icon: '💷',
        description: 'British Pound against US Dollar'
    },
    'USDJPY': {
        name: 'US Dollar vs Japanese Yen',
        displayName: 'USD/JPY',
        category: 'Forex',
        categoryColor: '#E67E22',
        basePrice: 148.50,
        volatility: 0.80,
        decimals: 3,
        pipValue: 0.01,
        newsKeywords: ['yen', 'JPY', 'Bank of Japan', 'BOJ'],
        icon: '💴',
        description: 'US Dollar against Japanese Yen'
    },
    'AUDUSD': {
        name: 'Australian Dollar vs US Dollar',
        displayName: 'AUD/USD',
        category: 'Forex',
        categoryColor: '#16A085',
        basePrice: 0.6550,
        volatility: 0.006,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['aussie', 'AUD', 'RBA', 'Reserve Bank of Australia'],
        icon: '🇦🇺',
        description: 'Australian Dollar against US Dollar'
    },
    'USDCAD': {
        name: 'US Dollar vs Canadian Dollar',
        displayName: 'USD/CAD',
        category: 'Forex',
        categoryColor: '#C0392B',
        basePrice: 1.3550,
        volatility: 0.007,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['loonie', 'CAD', 'Bank of Canada', 'oil prices'],
        icon: '🇨🇦',
        description: 'US Dollar against Canadian Dollar'
    },
    'NZDUSD': {
        name: 'New Zealand Dollar vs US Dollar',
        displayName: 'NZD/USD',
        category: 'Forex',
        categoryColor: '#8E44AD',
        basePrice: 0.6150,
        volatility: 0.006,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['kiwi', 'NZD', 'RBNZ', 'Reserve Bank of New Zealand'],
        icon: '🇳🇿',
        description: 'New Zealand Dollar against US Dollar'
    },
    'USDCHF': {
        name: 'US Dollar vs Swiss Franc',
        displayName: 'USD/CHF',
        category: 'Forex',
        categoryColor: '#34495E',
        basePrice: 0.8850,
        volatility: 0.006,
        decimals: 5,
        pipValue: 0.0001,
        newsKeywords: ['franc', 'CHF', 'SNB', 'Swiss National Bank'],
        icon: '🇨🇭',
        description: 'US Dollar against Swiss Franc'
    },

    // ==================== CRYPTOCURRENCIES ====================
    'BTCUSD': {
        name: 'Bitcoin',
        displayName: 'BTC/USD',
        category: 'Crypto',
        categoryColor: '#F7931A',
        basePrice: 65000,
        volatility: 2500,
        decimals: 2,
        pipValue: 1,
        newsKeywords: ['bitcoin', 'BTC', 'cryptocurrency', 'blockchain'],
        icon: '₿',
        description: 'Bitcoin against US Dollar'
    },
    'ETHUSD': {
        name: 'Ethereum',
        displayName: 'ETH/USD',
        category: 'Crypto',
        categoryColor: '#627EEA',
        basePrice: 3200,
        volatility: 150,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['ethereum', 'ETH', 'smart contracts', 'DeFi'],
        icon: 'Ξ',
        description: 'Ethereum against US Dollar'
    },
    'XRPUSD': {
        name: 'Ripple',
        displayName: 'XRP/USD',
        category: 'Crypto',
        categoryColor: '#23292F',
        basePrice: 0.55,
        volatility: 0.05,
        decimals: 4,
        pipValue: 0.0001,
        newsKeywords: ['ripple', 'XRP', 'Ripple Labs'],
        icon: '◎',
        description: 'Ripple against US Dollar'
    },
    'LTCUSD': {
        name: 'Litecoin',
        displayName: 'LTC/USD',
        category: 'Crypto',
        categoryColor: '#345D9D',
        basePrice: 85,
        volatility: 8,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['litecoin', 'LTC', 'silver to bitcoin gold'],
        icon: 'Ł',
        description: 'Litecoin against US Dollar'
    },
    'ADAUSD': {
        name: 'Cardano',
        displayName: 'ADA/USD',
        category: 'Crypto',
        categoryColor: '#0033AD',
        basePrice: 0.45,
        volatility: 0.04,
        decimals: 4,
        pipValue: 0.0001,
        newsKeywords: ['cardano', 'ADA', 'proof of stake'],
        icon: '₳',
        description: 'Cardano against US Dollar'
    },
    'SOLUSD': {
        name: 'Solana',
        displayName: 'SOL/USD',
        category: 'Crypto',
        categoryColor: '#14F195',
        basePrice: 110,
        volatility: 12,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['solana', 'SOL', 'high-speed blockchain'],
        icon: '◎',
        description: 'Solana against US Dollar'
    },
    'DOGEUSD': {
        name: 'Dogecoin',
        displayName: 'DOGE/USD',
        category: 'Crypto',
        categoryColor: '#C2A633',
        basePrice: 0.08,
        volatility: 0.008,
        decimals: 5,
        pipValue: 0.00001,
        newsKeywords: ['dogecoin', 'DOGE', 'meme coin'],
        icon: 'Ð',
        description: 'Dogecoin against US Dollar'
    },

    // ==================== VOLATILITY INDICES ====================
    'VOL75': {
        name: 'Volatility 75 Index',
        displayName: 'Volatility 75',
        category: 'Volatility',
        categoryColor: '#9B59B6',
        basePrice: 2500000,
        volatility: 50000,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['volatility', 'synthetic indices', 'VIX'],
        icon: '📊',
        description: 'Synthetic index with 75% volatility'
    },
    'VOL100': {
        name: 'Volatility 100 Index',
        displayName: 'Volatility 100',
        category: 'Volatility',
        categoryColor: '#E91E63',
        basePrice: 3500000,
        volatility: 70000,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['volatility', 'synthetic indices', 'VIX'],
        icon: '📈',
        description: 'Synthetic index with 100% volatility'
    },
    'VOL25': {
        name: 'Volatility 25 Index',
        displayName: 'Volatility 25',
        category: 'Volatility',
        categoryColor: '#00BCD4',
        basePrice: 1200000,
        volatility: 25000,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['volatility', 'synthetic indices'],
        icon: '📉',
        description: 'Synthetic index with 25% volatility'
    },
    'VOL50': {
        name: 'Volatility 50 Index',
        displayName: 'Volatility 50',
        category: 'Volatility',
        categoryColor: '#FF9800',
        basePrice: 1800000,
        volatility: 35000,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['volatility', 'synthetic indices'],
        icon: '📊',
        description: 'Synthetic index with 50% volatility'
    },
    'VOL10': {
        name: 'Volatility 10 Index',
        displayName: 'Volatility 10',
        category: 'Volatility',
        categoryColor: '#4CAF50',
        basePrice: 800000,
        volatility: 15000,
        decimals: 2,
        pipValue: 0.01,
        newsKeywords: ['volatility', 'synthetic indices'],
        icon: '📊',
        description: 'Synthetic index with 10% volatility'
    }
};

/**
 * Get asset configuration by symbol
 * @param {String} symbol - Asset symbol (e.g., 'XAUUSD', 'BTCUSD')
 * @returns {Object} Asset configuration object
 */
function getAssetConfig(symbol) {
    return ASSET_CONFIG[symbol] || ASSET_CONFIG['XAUUSD'];
}

/**
 * Get all assets grouped by category
 * @returns {Object} Assets grouped by category
 */
function getAssetsByCategory() {
    const grouped = {
        Forex: [],
        Crypto: [],
        Volatility: []
    };

    Object.entries(ASSET_CONFIG).forEach(([symbol, config]) => {
        grouped[config.category].push({
            symbol,
            ...config
        });
    });

    return grouped;
}

/**
 * Get all asset symbols
 * @returns {Array} Array of all asset symbols
 */
function getAllAssetSymbols() {
    return Object.keys(ASSET_CONFIG);
}

/**
 * Format price according to asset's decimal precision
 * @param {Number} price - Price to format
 * @param {String} symbol - Asset symbol
 * @returns {String} Formatted price
 */
function formatAssetPrice(price, symbol) {
    const config = getAssetConfig(symbol);
    return price.toFixed(config.decimals);
}

/**
 * Get display symbol with currency prefix
 * @param {String} symbol - Asset symbol
 * @returns {String} Display symbol (e.g., '$2,050.00' or '₿65,000.00')
 */
function getDisplayPrice(price, symbol) {
    const config = getAssetConfig(symbol);
    const formattedPrice = formatAssetPrice(price, symbol);

    // Add thousand separators
    const parts = formattedPrice.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // For crypto, use icon; for forex, use $
    if (config.category === 'Crypto') {
        return `${config.icon}${parts.join('.')}`;
    } else if (symbol === 'XAUUSD') {
        return `$${parts.join('.')}`;
    } else {
        return parts.join('.');
    }
}

console.log('📦 Asset configuration loaded:', Object.keys(ASSET_CONFIG).length, 'assets');
