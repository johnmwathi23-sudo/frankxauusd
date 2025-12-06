// ============================================
// Multi-Asset Trading Analyzer - News Feed
// Fetches and displays market news for selected asset
// ============================================

// News configuration
const NEWS_CONFIG = {
    apiKey: localStorage.getItem('newsApiKey') || '',
    updateInterval: 900000, // 15 minutes
    isDemoMode: true // Start with demo mode
};

// News cache
let newsCache = [];

/**
 * Fetch asset-specific news from News API
 * @param {String} asset - Asset symbol
 * @returns {Promise<Array>} Array of news items
 */
async function fetchAssetNews(asset = 'XAUUSD') {
    if (NEWS_CONFIG.isDemoMode || !NEWS_CONFIG.apiKey) {
        return generateDemoNews(asset);
    }

    try {
        const assetConfig = getAssetConfig(asset);
        const keywords = assetConfig.newsKeywords.join(' OR ');
        const query = `${keywords} OR "${assetConfig.displayName}"`;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${NEWS_CONFIG.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.articles) {
            return parseNewsData(data.articles.slice(0, 10));
        } else {
            console.warn('News API error, using demo news');
            NEWS_CONFIG.isDemoMode = true;
            return generateDemoNews(asset);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return generateDemoNews(asset);
    }
}

// Keep old function name for backward compatibility
async function fetchGoldNews() {
    return fetchAssetNews('XAUUSD');
}

/**
 * Parse and format news data from API
 * @param {Array} articles - Raw articles from News API
 * @returns {Array} Formatted news items
 */
function parseNewsData(articles) {
    return articles.map(article => ({
        title: article.title,
        summary: article.description || article.content?.substring(0, 150) + '...',
        source: article.source.name,
        timestamp: new Date(article.publishedAt),
        url: article.url,
        impact: detectHighImpact(article.title + ' ' + article.description)
    }));
}

/**
 * Detect if news is high-impact based on keywords
 * @param {String} text - News title and description
 * @returns {Boolean} True if high-impact
 */
function detectHighImpact(text) {
    const highImpactKeywords = [
        'federal reserve', 'interest rate', 'inflation', 'employment',
        'GDP', 'FOMC', 'central bank', 'monetary policy', 'breaking',
        'crisis', 'recession', 'surge', 'plunge', 'record'
    ];

    const lowerText = text.toLowerCase();
    return highImpactKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Generate demo news items for demonstration
 * @param {String} asset - Asset symbol
 * @returns {Array} Array of demo news items
 */
function generateDemoNews(asset = 'XAUUSD') {
    const assetConfig = getAssetConfig(asset);
    const assetName = assetConfig.name;
    const displayName = assetConfig.displayName;

    // Generate asset-specific demo news
    const demoArticles = [];

    // Asset-specific news templates
    if (assetConfig.category === 'Crypto') {
        demoArticles.push(
            {
                title: `${assetName} Sees Strong Momentum Amid Market Rally`,
                summary: `${displayName} continues its upward trajectory as cryptocurrency markets show renewed strength. Institutional interest remains high.`,
                source: 'Crypto News Daily',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                impact: true
            },
            {
                title: `Technical Analysis: ${displayName} Key Levels to Watch`,
                summary: `Chart patterns suggest potential breakout for ${assetName}. Traders monitor critical support and resistance zones.`,
                source: 'Trading Insights',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                impact: false
            },
            {
                title: `Blockchain Activity Surges for ${assetName}`,
                summary: `On-chain metrics show increased activity and transaction volume for ${displayName}, signaling growing adoption.`,
                source: 'Blockchain Analytics',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                impact: true
            }
        );
    } else if (assetConfig.category === 'Forex') {
        demoArticles.push(
            {
                title: `${displayName} Holds Steady Amid Central Bank Policy Expectations`,
                summary: `${assetName} remains stable as traders await key economic data releases and central bank decisions.`,
                source: 'Financial News Network',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                impact: true
            },
            {
                title: `${displayName} Technical Outlook: Support Levels Hold`,
                summary: `Technical analysts identify critical support levels for ${displayName} as the pair consolidates recent movements.`,
                source: 'FX Analysis',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                impact: false
            },
            {
                title: `Economic Data Impacts ${displayName} Trading`,
                summary: `Latest economic indicators influence ${displayName} direction as market participants adjust positions.`,
                source: 'Reuters Markets',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                impact: true
            }
        );
    } else if (assetConfig.category === 'Volatility') {
        demoArticles.push(
            {
                title: `${displayName} Shows Increased Activity`,
                summary: `${assetName} experiences heightened volatility as market conditions create trading opportunities.`,
                source: 'Volatility Trading',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                impact: true
            },
            {
                title: `Technical Patterns Emerge on ${displayName}`,
                summary: `Traders identify key technical setups on ${displayName} as the index continues its characteristic movement.`,
                source: 'Synthetic Indices Analysis',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                impact: false
            },
            {
                title: `${displayName} Trading Volume Surges`,
                summary: `Increased trading activity on ${displayName} reflects growing interest in volatility index trading.`,
                source: 'Market Watch',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                impact: false
            }
        );
    }

    // Add general market news
    demoArticles.push(
        {
            title: 'Market Volatility Creates Trading Opportunities',
            summary: 'Increased market volatility across asset classes presents opportunities for active traders using technical analysis strategies.',
            source: 'Trading Weekly',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            impact: false
        },
        {
            title: 'Global Economic Outlook Influences Asset Prices',
            summary: 'Macroeconomic factors continue to drive price action across multiple markets as investors assess risk.',
            source: 'Economic Times',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            impact: true
        }
    );

    return demoArticles;
}

/**
 * Display news items in the news container
 * @param {Array} newsItems - Array of news items to display
 */
function displayNews(newsItems) {
    const container = document.getElementById('newsContainer');

    if (!newsItems || newsItems.length === 0) {
        container.innerHTML = '<div class="news-item"><p>No news available at this time.</p></div>';
        return;
    }

    container.innerHTML = newsItems.map(item => `
        <div class="news-item">
            <div class="news-badge ${item.impact ? 'high-impact' : ''}">${item.impact ? 'HIGH IMPACT' : item.source}</div>
            <h3 class="news-title">${item.title}</h3>
            <p class="news-summary">${item.summary}</p>
            <span class="news-time">${formatTimeAgo(item.timestamp)}</span>
        </div>
    `).join('');

    console.log(`📰 ${newsItems.length} news items displayed`);
}

/**
 * Format timestamp as "time ago" string
 * @param {Date} timestamp - News timestamp
 * @returns {String} Formatted time ago string
 */
function formatTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Update news feed for current asset
 * @param {String} asset - Asset symbol (optional, uses current asset if not provided)
 */
async function updateNews(asset) {
    try {
        // If no asset provided, try to get from AppState (if available)
        const targetAsset = asset || (typeof AppState !== 'undefined' ? AppState.currentAsset : 'XAUUSD');
        const newsItems = await fetchAssetNews(targetAsset);
        newsCache = newsItems;
        displayNews(newsItems);
    } catch (error) {
        console.error('Error updating news:', error);
    }
}

/**
 * Get cached news
 * @returns {Array} Cached news items
 */
function getCachedNews() {
    return newsCache;
}

/**
 * Toggle news demo mode
 * @param {Boolean} isDemoMode - Whether to use demo mode
 */
function setNewsDemoMode(isDemoMode) {
    NEWS_CONFIG.isDemoMode = isDemoMode;
}

/**
 * Update news API key
 * @param {String} apiKey - News API key
 */
function updateNewsApiKey(apiKey) {
    NEWS_CONFIG.apiKey = apiKey;
    localStorage.setItem('newsApiKey', apiKey);
    console.log('News API key updated');
}
