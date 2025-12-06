// ============================================
// XAUUSD Trading Analyzer - Main Application
// Orchestrates all components and handles user interactions
// ============================================

// Application state
const AppState = {
    currentAsset: localStorage.getItem('currentAsset') || 'XAUUSD',
    currentTimeframe: 'H4',
    autoRefreshId: null,
    useRSIConfirmation: true,
    useADXConfirmation: true,
    lastSignal: null,
    isInitialized: false
};

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing XAUUSD Trading Analyzer...');

    // Initialize all components
    initializeApp();

    // Set up event listeners
    setupEventListeners();

    // Start auto-refresh
    startDataRefresh();

    console.log('✅ Application initialized successfully');
    AppState.isInitialized = true;
});

/**
 * Initialize all application components
 */
function initializeApp() {
    // Set initial asset in selector
    document.getElementById('assetSelect').value = AppState.currentAsset;

    // Update UI with current asset
    updateAssetDisplay();

    // Initialize gauges
    initializeGauges();

    // Load saved settings
    loadSettings();

    // Initial data load
    updateDashboard();

    // Load news
    updateNews();
}

/**
 * Main dashboard update function - fetches data and updates UI
 */
async function updateDashboard() {
    try {
        console.log('🔄 Updating dashboard...');

        // Show loading state
        setLoadingState(true);

        // 1. Fetch market data
        const marketData = await updateMarketData(AppState.currentTimeframe, AppState.currentAsset);

        // 2. Update price display
        updatePriceDisplay(marketData);

        // 3. Calculate technical indicators
        const indicators = calculateAllIndicators(marketData);

        // 4. Calculate signal strength
        const signalStrength = calculateSignalStrength({
            ...indicators,
            useRSI: AppState.useRSIConfirmation,
            useADX: AppState.useADXConfirmation
        });

        // 5. Update gauges
        const gaugeValues = calculateGaugeValues(indicators);
        gaugeValues.overall = signalStrength.strength;
        updateAllGauges(gaugeValues);

        // 6. Update analysis panel
        updateAnalysisPanel(indicators, signalStrength);

        // 7. Check for trading signals
        const alert = checkForSignals(indicators, signalStrength);
        if (alert && (!AppState.lastSignal || AppState.lastSignal.id !== alert.id)) {
            triggerAlert(alert);
            AppState.lastSignal = alert;
        }

        // 8. Update last updated timestamp
        updateTimestamp();

        // Clear loading state
        setLoadingState(false);

        console.log('✅ Dashboard updated successfully');

    } catch (error) {
        console.error('❌ Error updating dashboard:', error);
        setLoadingState(false);
    }
}

/**
 * Calculate all technical indicators from market data
 * @param {Object} marketData - Market data with candles
 * @returns {Object} All calculated indicators
 */
function calculateAllIndicators(marketData) {
    const { candles, currentPrice } = marketData;

    if (!candles || candles.length < 50) {
        console.warn('Insufficient candle data for analysis');
        return getDefaultIndicators(currentPrice);
    }

    // Extract price arrays
    const closePrices = candles.map(c => c.close);
    const highPrices = candles.map(c => c.high);
    const lowPrices = candles.map(c => c.low);

    // Calculate EMA
    const emaH4 = calculateEMA(closePrices, 200);
    const emaD1 = calculateEMA(closePrices.slice(-100), 200); // Simplified D1

    // Calculate RSI
    const rsi = calculateRSI(closePrices, 7);

    // Calculate ADX
    const adx = calculateADX(highPrices, lowPrices, closePrices, 14);

    // Detect patterns
    const liquiditySweep = detectLiquiditySweep(candles);
    const breakRetest = detectBreakRetest(candles);

    // Find swing points
    const swingPoints = findSwingPoints(candles, 20);

    return {
        price: currentPrice,
        emaH4,
        emaD1,
        rsi,
        adx,
        liquiditySweep,
        breakRetest,
        swingHigh: swingPoints.swingHigh,
        swingLow: swingPoints.swingLow
    };
}

/**
 * Get default indicators when data is insufficient
 */
function getDefaultIndicators(price) {
    return {
        price: price || 2050,
        emaH4: null,
        emaD1: null,
        rsi: 50,
        adx: 25,
        liquiditySweep: { detected: false, type: null, level: null, strength: 0 },
        breakRetest: { detected: false, type: null, level: null, strength: 0 },
        swingHigh: null,
        swingLow: null
    };
}

/**
 * Update price display in header
 * @param {Object} marketData - Market data
 */
function updatePriceDisplay(marketData) {
    const { currentPrice, priceChange, priceChangePercent } = marketData;
    const assetConfig = getAssetConfig(AppState.currentAsset);

    const priceElement = document.getElementById('currentPrice');
    const changeElement = document.getElementById('priceChange');

    // Format price according to asset
    const formattedPrice = getDisplayPrice(currentPrice, AppState.currentAsset);
    priceElement.textContent = formattedPrice;

    const changeText = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(assetConfig.decimals)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`;
    changeElement.textContent = changeText;
    changeElement.className = `price-change ${priceChange >= 0 ? 'positive' : 'negative'}`;
}

/**
 * Update analysis panel with indicator values
 * @param {Object} indicators - Calculated indicators
 * @param {Object} signalStrength - Signal strength data
 */
function updateAnalysisPanel(indicators, signalStrength) {
    const { price, emaH4, emaD1, rsi, adx, swingHigh, swingLow, liquiditySweep, breakRetest } = indicators;

    // Market structure
    document.getElementById('swingHigh').textContent = swingHigh ? `$${swingHigh.toFixed(2)}` : '--';
    document.getElementById('swingLow').textContent = swingLow ? `$${swingLow.toFixed(2)}` : '--';

    const biasElement = document.getElementById('marketBias');
    biasElement.textContent = signalStrength.signal;
    biasElement.className = `info-value badge ${signalStrength.signal.toLowerCase()}`;

    // Technical indicators
    document.getElementById('emaH4').textContent = emaH4 ? `$${emaH4.toFixed(2)}` : '--';
    document.getElementById('emaD1').textContent = emaD1 ? `$${emaD1.toFixed(2)}` : '--';
    document.getElementById('rsiValue').textContent = rsi ? rsi.toFixed(1) : '--';
    document.getElementById('adxValue').textContent = adx ? adx.toFixed(1) : '--';

    // Recent activity
    updateActivityList(liquiditySweep, breakRetest);

    // Trade levels
    updateTradeLevels(price, swingHigh, swingLow, signalStrength.signal);
}

/**
 * Update activity list with recent patterns
 */
function updateActivityList(liquiditySweep, breakRetest) {
    const activityList = document.getElementById('activityList');
    const activities = [];

    if (liquiditySweep.detected) {
        activities.push(`<p class="activity-item">💧 ${liquiditySweep.type === 'bullish' ? 'Bullish' : 'Bearish'} liquidity sweep detected at $${liquiditySweep.level.toFixed(2)}</p>`);
    }

    if (breakRetest.detected) {
        activities.push(`<p class="activity-item">📈 ${breakRetest.type === 'bullish' ? 'Bullish' : 'Bearish'} break & retest confirmed at $${breakRetest.level.toFixed(2)}</p>`);
    }

    if (activities.length === 0) {
        activityList.innerHTML = '<p class="activity-item">No recent liquidity sweeps or break & retest patterns detected</p>';
    } else {
        activityList.innerHTML = activities.join('');
    }
}

/**
 * Update suggested trade levels
 */
function updateTradeLevels(price, swingHigh, swingLow, signal) {
    const assetConfig = getAssetConfig(AppState.currentAsset);
    const decimals = assetConfig.decimals;

    let entry, stopLoss, tp1, tp2;

    if (signal === 'BUY') {
        entry = price;
        stopLoss = swingLow ? swingLow - (assetConfig.volatility * 0.25) : price - (assetConfig.volatility * 0.75);
        const risk = entry - stopLoss;
        tp1 = entry + (risk * 1.5);
        tp2 = entry + (risk * 2.5);
    } else if (signal === 'SELL') {
        entry = price;
        stopLoss = swingHigh ? swingHigh + (assetConfig.volatility * 0.25) : price + (assetConfig.volatility * 0.75);
        const risk = stopLoss - entry;
        tp1 = entry - (risk * 1.5);
        tp2 = entry - (risk * 2.5);
    } else {
        // Neutral - show both scenarios
        entry = price;
        stopLoss = price - (assetConfig.volatility * 0.5);
        tp1 = price + (assetConfig.volatility * 0.75);
        tp2 = price + (assetConfig.volatility * 1.25);
    }

    document.getElementById('entryPrice').textContent = formatAssetPrice(entry, AppState.currentAsset);
    document.getElementById('stopLoss').textContent = formatAssetPrice(stopLoss, AppState.currentAsset);
    document.getElementById('takeProfit1').textContent = formatAssetPrice(tp1, AppState.currentAsset);
    document.getElementById('takeProfit2').textContent = formatAssetPrice(tp2, AppState.currentAsset);
}

/**
 * Update last updated timestamp
 */
function updateTimestamp() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
}

/**
 * Set loading state
 */
function setLoadingState(isLoading) {
    const refreshBtn = document.getElementById('refreshBtn');
    if (isLoading) {
        refreshBtn.classList.add('rotating');
    } else {
        refreshBtn.classList.remove('rotating');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        updateDashboard();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('active');
    });

    // Asset selector
    document.getElementById('assetSelect').addEventListener('change', (e) => {
        AppState.currentAsset = e.target.value;
        localStorage.setItem('currentAsset', AppState.currentAsset);
        updateAssetDisplay();
        updateDashboard();
        updateNews();
    });

    // Timeframe selector
    document.getElementById('timeframeSelect').addEventListener('change', (e) => {
        AppState.currentTimeframe = e.target.value;
        updateDashboard();
    });

    // RSI confirmation toggle
    document.getElementById('rsiConfirmation').addEventListener('change', (e) => {
        AppState.useRSIConfirmation = e.target.checked;
        updateDashboard();
    });

    // ADX confirmation toggle
    document.getElementById('adxConfirmation').addEventListener('change', (e) => {
        AppState.useADXConfirmation = e.target.checked;
        updateDashboard();
    });

    // Download CSV button
    document.getElementById('downloadCSV').addEventListener('click', downloadAnalysisCSV);

    // Demo mode toggle
    document.getElementById('demoModeToggle').addEventListener('click', toggleDemoMode);

    // Alert modal close
    document.getElementById('closeModal').addEventListener('click', closeAlertModal);
    document.getElementById('acknowledgeAlert').addEventListener('click', closeAlertModal);

    // Settings modal
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('active');
    });

    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });
}

/**
 * Start auto-refresh mechanism
 */
function startDataRefresh() {
    AppState.autoRefreshId = startAutoRefresh(() => {
        updateDashboard();
    });
}

/**
 * Download analysis as CSV
 */
function downloadAnalysisCSV() {
    const marketData = getMarketData();
    const gaugeValues = getCurrentGaugeValues();
    const alerts = getAlertHistory();
    const assetConfig = getAssetConfig(AppState.currentAsset);

    let csv = `${assetConfig.displayName} Trading Analysis Export\n\n`;
    csv += `Timestamp,${new Date().toISOString()}\n`;
    csv += `Asset,${assetConfig.displayName} (${assetConfig.name})\n`;
    csv += `Current Price,${formatAssetPrice(marketData.currentPrice, AppState.currentAsset)}\n`;
    csv += `Price Change,${marketData.priceChange.toFixed(assetConfig.decimals)} (${marketData.priceChangePercent.toFixed(2)}%)\n\n`;

    csv += 'Gauge Values\n';
    csv += 'Indicator,Value\n';
    csv += `Trend Strength,${gaugeValues.trend}\n`;
    csv += `Liquidity Sweep,${gaugeValues.liquidity}\n`;
    csv += `Break & Retest,${gaugeValues.breakRetest}\n`;
    csv += `RSI,${gaugeValues.rsi}\n`;
    csv += `ADX,${gaugeValues.adx}\n`;
    csv += `Overall Signal,${gaugeValues.overall}\n\n`;

    csv += 'Recent Alerts\n';
    csv += 'Type,Entry,Stop Loss,Take Profit 1,Take Profit 2,Confidence,Time\n';
    alerts.forEach(alert => {
        csv += `${alert.type},$${alert.entryPrice},$${alert.stopLoss},$${alert.takeProfit1},$${alert.takeProfit2},${alert.confidence},${alert.timestamp.toISOString()}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${AppState.currentAsset.toLowerCase()}-analysis-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Analysis exported to CSV');
}

/**
 * Toggle between demo and live mode
 */
function toggleDemoMode() {
    const button = document.getElementById('demoModeToggle');
    const statusText = document.querySelector('.status-text');
    const isDemoMode = !getApiConfig().isDemoMode;

    setDemoMode(isDemoMode);
    setNewsDemoMode(isDemoMode);

    button.textContent = isDemoMode ? 'Switch to Live Mode' : 'Switch to Demo Mode';
    statusText.textContent = isDemoMode ? 'Demo Mode' : 'Live Mode';

    updateDashboard();
    updateNews();
}

/**
 * Save settings from modal
 */
function saveSettings() {
    const alphaVantageKey = document.getElementById('alphaVantageKey').value;
    const newsApiKey = document.getElementById('newsApiKey').value;
    const soundAlerts = document.getElementById('soundAlerts').checked;
    const pushNotifications = document.getElementById('pushNotifications').checked;

    // Update API keys
    if (alphaVantageKey || newsApiKey) {
        updateApiKeys(alphaVantageKey, newsApiKey);
        if (newsApiKey) updateNewsApiKey(newsApiKey);
    }

    // Update alert settings
    updateAlertSettings(soundAlerts, pushNotifications);

    // Request notification permission if enabled
    if (pushNotifications) {
        requestNotificationPermission();
    }

    // Save visibility settings
    const showTrend = document.getElementById('showTrendGauge').checked;
    const showLiquidity = document.getElementById('showLiquidityGauge').checked;
    const showBreakRetest = document.getElementById('showBreakRetestGauge').checked;

    toggleGaugeVisibility('trend', showTrend);
    toggleGaugeVisibility('liquidity', showLiquidity);
    toggleGaugeVisibility('breakRetest', showBreakRetest);

    // Close modal
    document.getElementById('settingsModal').classList.remove('active');

    console.log('✅ Settings saved');
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
    localStorage.clear();
    location.reload();
}

/**
 * Load saved settings
 */
function loadSettings() {
    // Load API keys
    const alphaVantageKey = localStorage.getItem('alphaVantageKey') || '';
    const newsApiKey = localStorage.getItem('newsApiKey') || '';

    if (alphaVantageKey) document.getElementById('alphaVantageKey').value = alphaVantageKey;
    if (newsApiKey) document.getElementById('newsApiKey').value = newsApiKey;

    // Load alert settings
    const soundAlerts = localStorage.getItem('soundAlerts') !== 'false';
    const pushNotifications = localStorage.getItem('pushNotifications') === 'true';

    document.getElementById('soundAlerts').checked = soundAlerts;
    document.getElementById('pushNotifications').checked = pushNotifications;
}

// Handle page visibility change - pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Page hidden, pausing updates');
    } else {
        console.log('▶️ Page visible, resuming updates');
        updateDashboard();
    }
});

/**
 * Update asset display in UI
 */
function updateAssetDisplay() {
    const assetConfig = getAssetConfig(AppState.currentAsset);

    // Update asset label in header
    document.getElementById('assetLabel').textContent = assetConfig.displayName;

    // Update news title
    document.getElementById('newsTitle').textContent = `${assetConfig.displayName} Market News`;

    console.log(`📊 Asset switched to: ${assetConfig.displayName}`);
}

console.log('📊 Multi-Asset Trading Analyzer loaded');
