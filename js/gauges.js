// ============================================
// XAUUSD Trading Analyzer - Gauge Management
// Handles initialization and updates of all gauges using JustGage
// ============================================

// Global gauge instances
let gauges = {};

/**
 * Initialize all gauges with JustGage library
 * Creates 6 gauges: Trend, Liquidity, Break & Retest, RSI, ADX, Overall
 */
function initializeGauges() {
    // Trend Strength Gauge
    gauges.trend = new JustGage({
        id: 'trendGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '%',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 16,
        titleMinFontSize: 12,
        labelMinFontSize: 12,
        humanFriendly: true,
        formatNumber: true
    });

    // Liquidity Sweep Gauge
    gauges.liquidity = new JustGage({
        id: 'liquidityGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '%',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 16,
        titleMinFontSize: 12,
        labelMinFontSize: 12,
        humanFriendly: true,
        formatNumber: true
    });

    // Break & Retest Gauge
    gauges.breakRetest = new JustGage({
        id: 'breakRetestGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '%',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 16,
        titleMinFontSize: 12,
        labelMinFontSize: 12,
        humanFriendly: true,
        formatNumber: true
    });

    // RSI Gauge
    gauges.rsi = new JustGage({
        id: 'rsiGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 16,
        titleMinFontSize: 12,
        labelMinFontSize: 12,
        humanFriendly: true,
        formatNumber: true
    });

    // ADX Gauge
    gauges.adx = new JustGage({
        id: 'adxGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '%',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 16,
        titleMinFontSize: 12,
        labelMinFontSize: 12,
        humanFriendly: true,
        formatNumber: true
    });

    // Overall Strategy Gauge (larger, more prominent)
    gauges.overall = new JustGage({
        id: 'overallGauge',
        value: 50,
        min: 0,
        max: 100,
        title: '',
        label: '%',
        levelColors: ['#ef4444', '#f59e0b', '#10b981'],
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        donut: true,
        donutStartAngle: 270,
        valueMinFontSize: 20,
        titleMinFontSize: 14,
        labelMinFontSize: 14,
        humanFriendly: true,
        formatNumber: true
    });

    console.log('✅ All gauges initialized successfully');
}

/**
 * Update a specific gauge with new value
 * @param {String} gaugeName - Name of the gauge (trend, liquidity, breakRetest, rsi, adx, overall)
 * @param {Number} value - New value (0-100)
 * @param {String} type - Signal type: 'bullish', 'bearish', or 'neutral' (optional)
 */
function updateGauge(gaugeName, value, type = 'neutral') {
    if (!gauges[gaugeName]) {
        console.warn(`Gauge "${gaugeName}" not found`);
        return;
    }

    // Ensure value is within bounds
    const clampedValue = Math.max(0, Math.min(100, value));

    // Update the gauge
    gauges[gaugeName].refresh(clampedValue);

    // Optional: Update color based on type
    if (type === 'bullish' && clampedValue < 60) {
        // Force green color for confirmed bullish signal
        gauges[gaugeName].refresh(clampedValue, 100);
    } else if (type === 'bearish' && clampedValue > 40) {
        // Force red color for confirmed bearish signal
        gauges[gaugeName].refresh(clampedValue, 0);
    }
}

/**
 * Update all gauges at once with calculated values
 * @param {Object} gaugeValues - Object with all gauge values {trend, liquidity, breakRetest, rsi, adx, overall}
 */
function updateAllGauges(gaugeValues) {
    const { trend, liquidity, breakRetest, rsi, adx, overall } = gaugeValues;

    // Determine signal types based on values
    const getTrendType = (val) => {
        if (val >= 60) return 'bullish';
        if (val <= 40) return 'bearish';
        return 'neutral';
    };

    updateGauge('trend', trend, getTrendType(trend));
    updateGauge('liquidity', liquidity, getTrendType(liquidity));
    updateGauge('breakRetest', breakRetest, getTrendType(breakRetest));
    updateGauge('rsi', rsi, getTrendType(rsi));
    updateGauge('adx', adx, 'neutral'); // ADX doesn't have direction
    updateGauge('overall', overall, getTrendType(overall));

    console.log('📊 Gauges updated:', gaugeValues);
}

/**
 * Get the color for a gauge value
 * Helper function to determine gauge color
 * @param {Number} value - Gauge value (0-100)
 * @returns {String} Color hex code
 */
function getGaugeColor(value) {
    if (value >= 67) return '#10b981'; // Bullish green
    if (value >= 34) return '#f59e0b'; // Neutral yellow
    return '#ef4444'; // Bearish red
}

/**
 * Reset all gauges to neutral (50%)
 */
function resetGauges() {
    Object.keys(gauges).forEach(gaugeName => {
        updateGauge(gaugeName, 50);
    });
    console.log('🔄 Gauges reset to neutral');
}

/**
 * Toggle gauge visibility based on settings
 * @param {String} gaugeName - Name of the gauge
 * @param {Boolean} visible - Whether to show the gauge
 */
function toggleGaugeVisibility(gaugeName, visible) {
    const gaugeCard = document.querySelector(`#${gaugeName}Gauge`)?.closest('.gauge-card');
    if (gaugeCard) {
        gaugeCard.style.display = visible ? 'block' : 'none';
    }
}

/**
 * Get current gauge values
 * @returns {Object} Current values of all gauges
 */
function getCurrentGaugeValues() {
    const values = {};
    Object.keys(gauges).forEach(key => {
        values[key] = gauges[key]?.config?.value || 50;
    });
    return values;
}
