// ============================================
// XAUUSD Trading Analyzer - News Feed
// Fetches and displays gold market news
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
 * Fetch gold and XAUUSD news from News API
 * @returns {Promise<Array>} Array of news items
 */
async function fetchGoldNews() {
    if (NEWS_CONFIG.isDemoMode || !NEWS_CONFIG.apiKey) {
        return generateDemoNews();
    }

    try {
        const query = 'gold OR XAUUSD OR "gold prices" OR "precious metals"';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${NEWS_CONFIG.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.articles) {
            return parseNewsData(data.articles.slice(0, 10));
        } else {
            console.warn('News API error, using demo news');
            NEWS_CONFIG.isDemoMode = true;
            return generateDemoNews();
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return generateDemoNews();
    }
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
 * @returns {Array} Array of demo news items
 */
function generateDemoNews() {
    const demoArticles = [
        {
            title: 'Gold Prices Hold Steady Amid Fed Rate Decision Expectations',
            summary: 'Gold prices remained stable as investors await the Federal Reserve\'s upcoming interest rate decision. Market participants are closely monitoring economic indicators for signs of policy shifts.',
            source: 'Financial News Network',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            impact: true
        },
        {
            title: 'XAUUSD Technical Analysis: Key Support Levels to Watch',
            summary: 'Technical analysts identify critical support levels for gold as the precious metal consolidates recent gains. Chart patterns suggest potential for further upside movement.',
            source: 'Trading Insights',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            impact: false
        },
        {
            title: 'Central Banks Increase Gold Reserves in Q4 2025',
            summary: 'Global central banks continued their gold purchasing trend, adding significant amounts to their reserves. This sustained demand provides fundamental support for gold prices.',
            source: 'Bloomberg Markets',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            impact: true
        },
        {
            title: 'Dollar Weakness Boosts Gold Appeal for International Buyers',
            summary: 'A softer U.S. dollar is making gold more attractive for buyers holding other currencies. Foreign demand has picked up in Asian and European markets.',
            source: 'Reuters Commodities',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            impact: false
        },
        {
            title: 'Geopolitical Tensions Drive Safe-Haven Demand for Gold',
            summary: 'Rising geopolitical uncertainties have increased investor interest in safe-haven assets. Gold has benefited from this flight to quality.',
            source: 'Market Watch',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            impact: true
        },
        {
            title: 'Gold Mining Stocks Rally on Higher Metal Prices',
            summary: 'Major gold mining companies saw share price increases as the underlying commodity strengthens. Analysts upgrade ratings on select mining stocks.',
            source: 'Mining Weekly',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            impact: false
        },
        {
            title: 'Inflation Data Supports Precious Metals Investment Case',
            summary: 'Latest inflation figures reinforce gold\'s role as an inflation hedge. Institutional investors are increasing allocations to precious metals.',
            source: 'Investment Daily',
            timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
            impact: true
        },
        {
            title: 'Technical Breakout Signals Potential Bull Run for Gold',
            summary: 'Gold breaks through key resistance level, triggering buy signals on multiple technical indicators. Momentum traders enter long positions.',
            source: 'Trading View Analysis',
            timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
            impact: false
        }
    ];

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
 * Update news feed
 */
async function updateNews() {
    try {
        const newsItems = await fetchGoldNews();
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
