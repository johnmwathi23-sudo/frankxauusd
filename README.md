# XAUUSD Trading Analyzer

A comprehensive, responsive HTML-based trading analysis tool for XAUUSD (Gold) using the **Liquidity Sweep + Break & Retest** strategy.

![Trading Analyzer](https://img.shields.io/badge/Status-Ready-success) ![License](https://img.shields.io/badge/License-Educational-blue)

## 🌟 Features

### 📊 Signal Strength Gauges
- **Trend Strength** - 200 EMA analysis (H4 & D1 timeframes)
- **Liquidity Sweep Detection** - Identifies sweep patterns at key levels
- **Break & Retest Confirmation** - Detects valid break and retest setups
- **RSI (7) Indicator** - Momentum confirmation
- **ADX (14) Indicator** - Trend strength measurement
- **Overall Strategy Gauge** - Combined signal strength (0-100%)

All gauges feature real-time updates with color-coded signals:
- 🟢 Green (67-100%) = Bullish
- 🟡 Yellow (34-66%) = Neutral
- 🔴 Red (0-33%) = Bearish

### 📈 Detailed Analysis Panel
- Current market structure (swing highs/lows)
- Technical indicator values (EMA, RSI, ADX)
- Recent liquidity sweeps and break & retest patterns
- Suggested entry, stop-loss, and take-profit levels
- Market bias indicator (BUY/SELL/NEUTRAL)

### 🔔 Buy/Sell Alerts
- Automatic signal detection based on strategy confluence
- **Visual alerts** - Popup modal with full signal details
- **Sound notifications** - Distinct tones for BUY/SELL signals
- **Push notifications** - Browser notifications (requires permission)
- Alert history tracking (last 10 signals)

### 📰 Real-Time News Feed
- Live gold market news and updates
- High-impact event highlighting
- Auto-refresh every 15 minutes
- Sources include major financial news outlets

### 🎛️ User Controls
- **Timeframe Selector** - M5, M15, H1, H4, D1
- **Indicator Toggles** - Enable/disable individual gauges
- **RSI/ADX Confirmation** - Optional confirmation filters
- **Demo/Live Mode Toggle** - Switch between simulated and real data
- **CSV Export** - Download complete analysis and signal history

### 🎨 Premium Design
- Modern dark theme with gold accents
- Glassmorphism effects and smooth animations
- Fully responsive (Desktop, Tablet, Mobile)
- Optimized for both portrait and landscape orientations

## 🚀 Getting Started

### Quick Start (Demo Mode)
1. Download/clone this repository
2. Open `index.html` in your web browser
3. The site will start in **Demo Mode** with simulated data
4. Explore all features immediately without API keys

### Live Data Setup (Optional)
To use real-time data, you'll need API keys:

1. **Alpha Vantage** (for XAUUSD price data):
   - Get free key at: https://www.alphavantage.co/support/#api-key
   - 500 requests/day on free tier

2. **News API** (for gold market news):
   - Get free key at: https://newsapi.org/register
   - 100 requests/day on free tier

3. **Configure in Settings**:
   - Click the settings icon ⚙️ in the header
   - Enter your API keys
   - Click "Save Settings"
   - Toggle to "Live Mode"

## 📁 Project Structure

```
xauusd-trading-analyzer/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling (dark theme, responsive)
├── js/
│   ├── main.js           # Application orchestration
│   ├── indicators.js     # Technical indicator calculations
│   ├── gauges.js         # Gauge management (JustGage)
│   ├── api.js            # Data fetching & demo mode
│   ├── alerts.js         # Alert & notification system
│   └── news.js           # News feed integration
└── README.md             # This file
```

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic structure
- **CSS3** - Custom styling, grid, flexbox
- **Vanilla JavaScript** - No frameworks required
- **JustGage.js** - Gauge visualization library
- **Raphael.js** - SVG rendering (required by JustGage)

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Older browsers may have limited support

### Technical Indicators Explained

**EMA (Exponential Moving Average)**
- 200-period EMA on H4 and D1 timeframes
- Determines overall trend direction
- Price above EMA = bullish, below = bearish

**RSI (Relative Strength Index)**
- 7-period RSI for momentum
- > 70 = overbought, < 30 = oversold
- Used as confirmation filter

**ADX (Average Directional Index)**
- 14-period ADX for trend strength
- > 25 = strong trend, < 20 = weak trend
- Doesn't indicate direction, only strength

**Liquidity Sweep**
- Detects when price briefly sweeps past a key level then reverses
- Common institutional trading pattern
- High probability reversal setup

**Break & Retest**
- Identifies when price breaks a level and successfully retests it
- Confirms level flip (support becomes resistance or vice versa)
- Strong continuation signal

## 🎯 Trading Strategy Logic

### BUY Signal Triggers When:
1. Price is above 200 EMA (H4 & D1) - ✅ Bullish trend
2. Bullish liquidity sweep detected - ✅ Sweep of lows
3. Bullish break & retest confirmed - ✅ Support holds
4. RSI > 30 (optional confirmation) - ✅ Not oversold
5. ADX > 25 (optional confirmation) - ✅ Strong trend
6. **Overall signal strength ≥ 70%**

### SELL Signal Triggers When:
1. Price is below 200 EMA (H4 & D1) - ✅ Bearish trend
2. Bearish liquidity sweep detected - ✅ Sweep of highs
3. Bearish break & retest confirmed - ✅ Resistance holds
4. RSI < 70 (optional confirmation) - ✅ Not overbought
5. ADX > 25 (optional confirmation) - ✅ Strong trend
6. **Overall signal strength ≤ 30%**

## 📊 Data Sources

### Demo Mode (Default)
- Generates realistic simulated XAUUSD data
- Price follows realistic patterns with volatility
- Perfect for testing and demonstration
- No API keys required

### Live Mode
- **Price Data**: Alpha Vantage Currency Exchange API
- **News Data**: News API with gold/forex keyword filtering
- Auto-updates every 60 seconds (price) / 15 minutes (news)
- Fallback to demo data if API limits reached

## ⚙️ Configuration Options

### Settings Modal
- **API Keys**: Configure Alpha Vantage and News API keys
- **Notifications**: 
  - Sound alerts (on/off)
  - Push notifications (requires browser permission)
- **Display**: Toggle individual gauges visibility

### Control Panel
- **Timeframe**: Select analysis timeframe (M5-D1)
- **Confirmations**: Enable/disable RSI/ADX filters
- **Mode**: Switch between Demo and Live data
- **Export**: Download analysis as CSV

## 📱 Responsive Breakpoints

- **Desktop** (>1024px): 3-column grid layout
- **Tablet** (768px-1024px): 2-column layout
- **Mobile** (<768px): Single column, stacked components

## ⚠️ Important Disclaimers

> **FOR EDUCATIONAL PURPOSES ONLY**

This tool is designed for educational and demonstration purposes. It is **NOT financial advice**.

- ❌ Do not use as sole basis for trading decisions
- ❌ Past performance does not guarantee future results
- ❌ Trading carries significant risk of loss
- ✅ Always do your own research
- ✅ Consult licensed financial advisors
- ✅ Never risk more than you can afford to lose

## 🔐 Privacy & Data

- All settings stored locally in browser (localStorage)
- No data sent to external servers (except API calls)
- API keys stored only in your browser
- No cookies or tracking

## 📝 License

This project is provided for **educational purposes only**. 

## 🤝 Support

For issues, questions, or suggestions:
1. Check the browser console for error messages
2. Verify API keys are correctly entered
3. Ensure you're not exceeding API rate limits
4. Try switching to Demo Mode to isolate issues

## 🎓 Learning Resources

To better understand the trading concepts used in this analyzer:

- **Liquidity Sweeps**: Study institutional order flow and stop hunts
- **Break & Retest**: Learn about support/resistance level dynamics
- **EMA Strategy**: Research moving average crossover systems
- **RSI/ADX**: Understand momentum and trend strength indicators

## 🚀 Future Enhancements (Potential)

- [ ] Multi-currency support (EURUSD, GBPUSD, etc.)
- [ ] Historical backtest functionality
- [ ] More timeframe options
- [ ] Additional technical indicators
- [ ] Trade journal integration
- [ ] Email/SMS alerts
- [ ] Customizable alert thresholds

---

**Happy Trading! 📈💰**

*Remember: The best trader is an educated trader who manages risk wisely.*
