# Share Market Quantitative Trading Bot 📈

An automated AI trading bot that fetches daily NSE stock data, calculates technical indicators (RSI, MACD, SMA), and uses Google Gemini AI to generate structured BUY/SELL signals for both Intraday and Long Term strategies. 

## How it works

1. **Market Open (9:15 AM)**: Fetches live data and recent news for top NSE stocks. The AI analyzes the data and generates precise Entry, Targets, and Stop Loss points.
2. **Memory Tracking**: All generated signals are securely saved into `tracker.json`.
3. **Market Close (3:30 PM)**: Scans `tracker.json` for pending trades and checks them against the live closing market price to see if they hit their targets or stop loss, calculating accuracy.
4. **Telegram**: Sends all trade signals and End-Of-Day accuracy reports directly to your phone via Telegram.

## Setup Instructions for GitHub Actions

This bot is specifically configured to run entirely for free on GitHub Actions.

1. Fork or clone this repository.
2. Go to **Settings** -> **Actions** -> **General** -> Under "Workflow permissions", select **Read and write permissions** (This is required so the bot can save `tracker.json` back to the repo).
3. Go to **Settings** -> **Secrets and variables** -> **Actions**.
4. Add the following repository secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `GEMINI_API_KEY`

Once configured, GitHub will automatically run the bot every Monday-Friday at Market Open and Market Close!
