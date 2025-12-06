// ============================================
// XAUUSD Trading Analyzer - Technical Indicators
// Calculates EMA, RSI, ADX, and pattern detection
// ============================================

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price values (close prices)
 * @param {Number} period - EMA period (e.g., 200)
 * @returns {Number} Current EMA value
 */
function calculateEMA(data, period) {
    if (!data || data.length < period) return null;

    // Calculate smoothing multiplier: 2 / (period + 1)
    const multiplier = 2 / (period + 1);

    // Calculate initial SMA for the first EMA value
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

    // Calculate EMA for remaining data points
    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of close prices
 * @param {Number} period - RSI period (typically 7 or 14)
 * @returns {Number} RSI value (0-100)
 */
function calculateRSI(data, period = 7) {
    if (!data || data.length <= period) return 50; // Neutral default

    // Calculate price changes
    const changes = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
    }

    // Separate gains and losses
    let avgGain = 0;
    let avgLoss = 0;

    // Calculate initial averages
    for (let i = 0; i < period; i++) {
        if (changes[i] > 0) avgGain += changes[i];
        else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;

    // Calculate smoothed averages for remaining data
    for (let i = period; i < changes.length; i++) {
        if (changes[i] > 0) {
            avgGain = (avgGain * (period - 1) + changes[i]) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
        }
    }

    // Calculate RS and RSI
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
}

/**
 * Calculate Average Directional Index (ADX)
 * Simplified ADX calculation for trend strength
 * @param {Array} highData - Array of high prices
 * @param {Array} lowData - Array of low prices
 * @param {Array} closeData - Array of close prices
 * @param {Number} period - ADX period (typically 14)
 * @returns {Number} ADX value (0-100)
 */
function calculateADX(highData, lowData, closeData, period = 14) {
    if (!highData || highData.length <= period) return 20; // Neutral default

    // Simplified ADX: measure price volatility and trend strength
    const trueRanges = [];
    for (let i = 1; i < closeData.length; i++) {
        const high = highData[i];
        const low = lowData[i];
        const prevClose = closeData[i - 1];

        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trueRanges.push(tr);
    }

    // Calculate average true range
    const atr = trueRanges.slice(-period).reduce((sum, val) => sum + val, 0) / period;

    // Calculate directional movement
    let upMove = 0;
    let downMove = 0;
    for (let i = 1; i < Math.min(period, highData.length); i++) {
        const idx = highData.length - period + i;
        if (idx < 1) continue;

        upMove += Math.max(0, highData[idx] - highData[idx - 1]);
        downMove += Math.max(0, lowData[idx - 1] - lowData[idx]);
    }

    // Normalize to 0-100 scale
    const adx = Math.min(100, ((upMove + downMove) / atr) * 5);

    return adx;
}

/**
 * Detect liquidity sweep patterns
 * Looks for price wicks that sweep recent lows/highs then reverse
 * @param {Array} candles - Array of OHLC candles [{open, high, low, close}]
 * @returns {Object} Sweep information {detected, type, level, strength}
 */
function detectLiquiditySweep(candles) {
    if (!candles || candles.length < 20) {
        return { detected: false, type: null, level: null, strength: 0 };
    }

    const recent = candles.slice(-20); // Look at last 20 candles
    const latest = recent[recent.length - 1];

    // Find recent swing lows and highs
    const lows = recent.map(c => c.low);
    const highs = recent.map(c => c.high);

    const swingLow = Math.min(...lows.slice(0, -1)); // Previous swing low
    const swingHigh = Math.max(...highs.slice(0, -1)); // Previous swing high

    // Check for bullish sweep (sweep of lows then close higher)
    const bullishSweep = latest.low < swingLow && latest.close > (latest.open + (latest.high - latest.low) * 0.3);

    // Check for bearish sweep (sweep of highs then close lower)
    const bearishSweep = latest.high > swingHigh && latest.close < (latest.open - (latest.high - latest.low) * 0.3);

    if (bullishSweep) {
        const strength = Math.min(100, ((swingLow - latest.low) / swingLow) * 10000);
        return { detected: true, type: 'bullish', level: swingLow, strength };
    }

    if (bearishSweep) {
        const strength = Math.min(100, ((latest.high - swingHigh) / swingHigh) * 10000);
        return { detected: true, type: 'bearish', level: swingHigh, strength };
    }

    return { detected: false, type: null, level: null, strength: 0 };
}

/**
 * Detect break and retest patterns
 * Identifies when price breaks a level and successfully retests it
 * @param {Array} candles - Array of OHLC candles
 * @returns {Object} Break & retest info {detected, type, level, strength}
 */
function detectBreakRetest(candles) {
    if (!candles || candles.length < 30) {
        return { detected: false, type: null, level: null, strength: 0 };
    }

    const recent = candles.slice(-30);

    // Identify support/resistance levels (swing points)
    const levels = [];
    for (let i = 5; i < recent.length - 5; i++) {
        const candle = recent[i];
        const isSwingHigh = recent.slice(i - 5, i).every(c => c.high < candle.high) &&
            recent.slice(i + 1, i + 6).every(c => c.high < candle.high);
        const isSwingLow = recent.slice(i - 5, i).every(c => c.low > candle.low) &&
            recent.slice(i + 1, i + 6).every(c => c.low > candle.low);

        if (isSwingHigh) levels.push({ price: candle.high, type: 'resistance', index: i });
        if (isSwingLow) levels.push({ price: candle.low, type: 'support', index: i });
    }

    if (levels.length === 0) {
        return { detected: false, type: null, level: null, strength: 0 };
    }

    // Check for break and retest
    const latest = recent[recent.length - 1];
    const previous = recent.slice(-10, -1);

    for (const level of levels) {
        // Check bullish break & retest (break above resistance, retest as support)
        const brokeAbove = previous.some(c => c.close > level.price);
        const retestingAsSupport = latest.low <= level.price * 1.002 && latest.close > level.price;

        if (brokeAbove && retestingAsSupport && level.type === 'resistance') {
            const strength = 75; // High confidence for valid break & retest
            return { detected: true, type: 'bullish', level: level.price, strength };
        }

        // Check bearish break & retest (break below support, retest as resistance)
        const brokeBelow = previous.some(c => c.close < level.price);
        const retestingAsResistance = latest.high >= level.price * 0.998 && latest.close < level.price;

        if (brokeBelow && retestingAsResistance && level.type === 'support') {
            const strength = 75;
            return { detected: true, type: 'bearish', level: level.price, strength };
        }
    }

    return { detected: false, type: null, level: null, strength: 0 };
}

/**
 * Find swing highs and lows in price data
 * @param {Array} candles - Array of OHLC candles
 * @param {Number} lookback - Number of candles to look back (default 20)
 * @returns {Object} {swingHigh, swingLow}
 */
function findSwingPoints(candles, lookback = 20) {
    if (!candles || candles.length < lookback) {
        return { swingHigh: null, swingLow: null };
    }

    const recent = candles.slice(-lookback);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);

    return {
        swingHigh: Math.max(...highs),
        swingLow: Math.min(...lows)
    };
}

/**
 * Calculate overall signal strength based on all indicators
 * Combines trend, liquidity sweep, break & retest, RSI, and ADX
 * @param {Object} indicators - Object containing all indicator values
 * @returns {Object} {strength: 0-100, signal: 'BUY'|'SELL'|'NEUTRAL'}
 */
function calculateSignalStrength(indicators) {
    const {
        price,
        emaH4,
        emaD1,
        rsi,
        adx,
        liquiditySweep,
        breakRetest,
        useRSI = true,
        useADX = true
    } = indicators;

    let bullishScore = 0;
    let bearishScore = 0;
    let totalWeight = 0;

    // Trend analysis (30% weight)
    const trendWeight = 30;
    if (emaH4 && emaD1) {
        if (price > emaH4 && price > emaD1) bullishScore += trendWeight;
        else if (price < emaH4 && price < emaD1) bearishScore += trendWeight;
        else {
            // Mixed trend
            bullishScore += trendWeight * 0.3;
            bearishScore += trendWeight * 0.3;
        }
    }
    totalWeight += trendWeight;

    // Liquidity sweep (25% weight)
    const sweepWeight = 25;
    if (liquiditySweep && liquiditySweep.detected) {
        const sweepScore = (liquiditySweep.strength / 100) * sweepWeight;
        if (liquiditySweep.type === 'bullish') bullishScore += sweepScore;
        else if (liquiditySweep.type === 'bearish') bearishScore += sweepScore;
    }
    totalWeight += sweepWeight;

    // Break & Retest (25% weight)
    const breakWeight = 25;
    if (breakRetest && breakRetest.detected) {
        const breakScore = (breakRetest.strength / 100) * breakWeight;
        if (breakRetest.type === 'bullish') bullishScore += breakScore;
        else if (breakRetest.type === 'bearish') bearishScore += breakScore;
    }
    totalWeight += breakWeight;

    // RSI confirmation (10% weight)
    if (useRSI && rsi !== null) {
        const rsiWeight = 10;
        if (rsi > 50) {
            bullishScore += ((rsi - 50) / 50) * rsiWeight;
        } else {
            bearishScore += ((50 - rsi) / 50) * rsiWeight;
        }
        totalWeight += rsiWeight;
    }

    // ADX momentum (10% weight)
    if (useADX && adx !== null) {
        const adxWeight = 10;
        const trendingScore = (adx / 100) * adxWeight;
        // ADX doesn't indicate direction, just strength
        // Boost the winning side
        if (bullishScore > bearishScore) bullishScore += trendingScore;
        else if (bearishScore > bullishScore) bearishScore += trendingScore;
        totalWeight += adxWeight;
    }

    // Calculate final strength (0-100)
    const netScore = bullishScore - bearishScore;
    const strength = Math.min(100, Math.max(0, 50 + (netScore / totalWeight) * 50));

    // Determine signal
    let signal = 'NEUTRAL';
    if (strength >= 70) signal = 'BUY';
    else if (strength <= 30) signal = 'SELL';

    return {
        strength: Math.round(strength),
        signal,
        bullishScore: Math.round(bullishScore),
        bearishScore: Math.round(bearishScore)
    };
}

/**
 * Calculate individual gauge strengths for display
 * @param {Object} indicators - All indicator data
 * @returns {Object} Individual gauge values
 */
function calculateGaugeValues(indicators) {
    const { price, emaH4, emaD1, rsi, adx, liquiditySweep, breakRetest } = indicators;

    // Trend strength (based on price position relative to EMAs)
    let trendStrength = 50; // Neutral
    if (emaH4 && emaD1) {
        if (price > emaH4 && price > emaD1) {
            trendStrength = 50 + Math.min(50, ((price - emaD1) / emaD1) * 5000);
        } else if (price < emaH4 && price < emaD1) {
            trendStrength = 50 - Math.min(50, ((emaD1 - price) / emaD1) * 5000);
        }
    }

    // Liquidity sweep strength
    const liquidityStrength = liquiditySweep && liquiditySweep.detected
        ? (liquiditySweep.type === 'bullish' ? 50 + liquiditySweep.strength / 2 : 50 - liquiditySweep.strength / 2)
        : 50;

    // Break & retest strength
    const breakRetestStrength = breakRetest && breakRetest.detected
        ? (breakRetest.type === 'bullish' ? 50 + breakRetest.strength / 2 : 50 - breakRetest.strength / 2)
        : 50;

    // RSI gauge (directly use RSI value)
    const rsiStrength = rsi !== null ? rsi : 50;

    // ADX gauge (trend strength, neutral at 25)
    const adxStrength = adx !== null ? Math.min(100, adx * 1.5) : 50;

    return {
        trend: Math.round(trendStrength),
        liquidity: Math.round(liquidityStrength),
        breakRetest: Math.round(breakRetestStrength),
        rsi: Math.round(rsiStrength),
        adx: Math.round(adxStrength)
    };
}
