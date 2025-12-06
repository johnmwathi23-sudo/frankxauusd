// ============================================
// XAUUSD Trading Analyzer - Alert System
// Handles buy/sell signal detection and notifications
// ============================================

// Alert configuration
const ALERT_CONFIG = {
    soundEnabled: localStorage.getItem('soundAlerts') !== 'false',
    pushEnabled: localStorage.getItem('pushNotifications') === 'true',
    lastAlertTime: null,
    minTimeBetweenAlerts: 300000, // 5 minutes minimum between alerts
    signalThreshold: 70 // Minimum overall strength for alert (0-100)
};

// Alert history
let alertHistory = [];

/**
 * Check for buy/sell signals based on strategy logic
 * @param {Object} indicators - All calculated indicators
 * @param {Object} signalStrength - Overall signal strength data
 * @returns {Object|null} Alert object or null if no signal
 */
function checkForSignals(indicators, signalStrength) {
    const { strength, signal } = signalStrength;

    // Don't alert too frequently
    const now = Date.now();
    if (ALERT_CONFIG.lastAlertTime && (now - ALERT_CONFIG.lastAlertTime) < ALERT_CONFIG.minTimeBetweenAlerts) {
        return null;
    }

    // Check if signal strength meets threshold
    if (signal === 'BUY' && strength >= ALERT_CONFIG.signalThreshold) {
        return createAlert('BUY', indicators, strength);
    } else if (signal === 'SELL' && strength >= Math.abs(100 - ALERT_CONFIG.signalThreshold)) {
        return createAlert('SELL', indicators, strength);
    }

    return null;
}

/**
 * Create alert object with all necessary information
 * @param {String} type - 'BUY' or 'SELL'
 * @param {Object} indicators - Market indicators
 * @param {Number} confidence - Signal confidence (0-100)
 * @returns {Object} Alert object
 */
function createAlert(type, indicators, confidence) {
    const { price, swingHigh, swingLow } = indicators;

    let entryPrice, stopLoss, takeProfit1, takeProfit2, riskReward;

    if (type === 'BUY') {
        entryPrice = price;
        stopLoss = swingLow ? swingLow - 5 : price - 15;
        const risk = entryPrice - stopLoss;
        takeProfit1 = entryPrice + (risk * 1.5);
        takeProfit2 = entryPrice + (risk * 2.5);
        riskReward = '1:2';
    } else {
        entryPrice = price;
        stopLoss = swingHigh ? swingHigh + 5 : price + 15;
        const risk = stopLoss - entryPrice;
        takeProfit1 = entryPrice - (risk * 1.5);
        takeProfit2 = entryPrice - (risk * 2.5);
        riskReward = '1:2';
    }

    return {
        type,
        entryPrice: entryPrice.toFixed(2),
        stopLoss: stopLoss.toFixed(2),
        takeProfit1: takeProfit1.toFixed(2),
        takeProfit2: takeProfit2.toFixed(2),
        riskReward,
        confidence: `${confidence >= 80 ? 'High' : 'Medium'} (${confidence}%)`,
        timestamp: new Date(),
        id: Date.now()
    };
}

/**
 * Trigger an alert - show modal, play sound, send notification
 * @param {Object} alert - Alert object from createAlert()
 */
function triggerAlert(alert) {
    // Update last alert time
    ALERT_CONFIG.lastAlertTime = Date.now();

    // Add to history
    alertHistory.unshift(alert);
    if (alertHistory.length > 10) alertHistory.pop(); // Keep only last 10

    // Show visual alert modal
    showAlertModal(alert);

    // Play sound
    if (ALERT_CONFIG.soundEnabled) {
        playAlertSound(alert.type);
    }

    // Send push notification
    if (ALERT_CONFIG.pushEnabled) {
        showPushNotification(alert);
    }

    console.log(`🚨 ${alert.type} ALERT TRIGGERED:`, alert);
}

/**
 * Display alert modal with signal details
 * @param {Object} alert - Alert object
 */
function showAlertModal(alert) {
    const modal = document.getElementById('alertModal');
    const alertIcon = document.getElementById('alertIcon');
    const signalType = document.getElementById('signalType');

    // Update modal content
    signalType.textContent = `${alert.type} SIGNAL`;
    signalType.className = `signal-type ${alert.type.toLowerCase()}`;
    alertIcon.className = `alert-icon ${alert.type.toLowerCase()}`;

    document.getElementById('alertEntryPrice').textContent = `$${alert.entryPrice}`;
    document.getElementById('alertStopLoss').textContent = `$${alert.stopLoss}`;
    document.getElementById('alertTP1').textContent = `$${alert.takeProfit1}`;
    document.getElementById('alertTP2').textContent = `$${alert.takeProfit2}`;
    document.getElementById('alertRR').textContent = alert.riskReward;
    document.getElementById('alertConfidence').textContent = alert.confidence;
    document.getElementById('alertTime').textContent = alert.timestamp.toLocaleTimeString();

    // Show modal with animation
    modal.classList.add('active');
}

/**
 * Close alert modal
 */
function closeAlertModal() {
    const modal = document.getElementById('alertModal');
    modal.classList.remove('active');
}

/**
 * Play alert sound using Web Audio API
 * @param {String} type - 'BUY' or 'SELL'
 */
function playAlertSound(type) {
    try {
        // Create simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different frequencies for buy/sell
        oscillator.frequency.value = type === 'BUY' ? 800 : 600;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Could not play alert sound:', error);
    }
}

/**
 * Show browser push notification
 * @param {Object} alert - Alert object
 */
function showPushNotification(alert) {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(`XAUUSD ${alert.type} Signal`, {
            body: `Entry: $${alert.entryPrice} | SL: $${alert.stopLoss} | TP: $${alert.takeProfit1}`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>',
            tag: 'xauusd-signal',
            requireInteraction: true
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showPushNotification(alert);
            }
        });
    }
}

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return false;
    }

    const permission = await Notification.requestPermission();
    ALERT_CONFIG.pushEnabled = permission === 'granted';
    localStorage.setItem('pushNotifications', ALERT_CONFIG.pushEnabled);

    return permission === 'granted';
}

/**
 * Update alert settings
 * @param {Boolean} soundEnabled - Enable sound alerts
 * @param {Boolean} pushEnabled - Enable push notifications
 */
function updateAlertSettings(soundEnabled, pushEnabled) {
    ALERT_CONFIG.soundEnabled = soundEnabled;
    ALERT_CONFIG.pushEnabled = pushEnabled;

    localStorage.setItem('soundAlerts', soundEnabled);
    localStorage.setItem('pushNotifications', pushEnabled);

    console.log('Alert settings updated:', { soundEnabled, pushEnabled });
}

/**
 * Get alert history
 * @returns {Array} Array of previous alerts
 */
function getAlertHistory() {
    return alertHistory;
}

/**
 * Clear alert history
 */
function clearAlertHistory() {
    alertHistory = [];
    console.log('Alert history cleared');
}

/**
 * Get alert configuration
 * @returns {Object} Current alert config
 */
function getAlertConfig() {
    return { ...ALERT_CONFIG };
}
