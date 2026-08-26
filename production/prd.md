# Product Requirements Document (PRD)

## 1. Product Overview
**Product Name:** Automated AI Quantitative Trading System (Share Market Bot)  
**Version:** 1.0.0  
**Target Audience:** Algorithmic traders, quantitative analysts, and financial enthusiasts looking to automate market analysis.  
**Core Purpose:** To provide a fully automated, cloud-hosted, zero-cost intelligence system that analyzes top NSE (National Stock Exchange) stocks, generates trading signals using LLMs (Large Language Models), tracks historical accuracy, and broadcasts reports directly to end-users via a React web dashboard and Telegram.

---

## 2. Key Features & Capabilities

### 2.1 Automated Market Data Ingestion
- Automatically fetches OHLCV (Open, High, Low, Close, Volume) data for 10 major NSE stocks.
- Utilizes the `yfinance` API to retrieve historical and real-time market ticks.
- Computes foundational technical indicators (e.g., Simple Moving Averages) to provide market context.

### 2.2 LLM-Powered Signal Generation
- Integrates with the **Google Gemini 3.6 Flash** API.
- Feeds structured market data and strict system prompts into the AI to generate JSON-formatted trading signals.
- Distinguishes between two distinct trading strategies:
  - **Intraday:** Short-term setups (Max 5 signals generated per day).
  - **Investment:** Long-term setups (Max 2 signals generated per week).

### 2.3 Intelligent State Tracking & Memory
- Features a persistent lightweight database (`tracker.json`) to store generated signals.
- Validates active "PENDING" signals against live market prices at the end of every trading day to determine if targets (T1, T2, T3) or Stop Losses were hit.
- Resolves trades into `WIN` or `LOSS` states.
- Automatically calculates historical accuracy and estimated net Profit & Loss (P&L).

### 2.4 Multi-Channel Reporting
- **Telegram Bot Integration:** Sends instant alerts for new trading setups and morning summary reports (including weekly accuracy metrics).
- **React Web Dashboard:** A premium, dark-mode glassmorphic web application deployed via GitHub Pages that reads from `tracker.json` to visualize:
  - Active Intraday and Investment setups.
  - Historical Analytics (Win rate, Completed trade log, estimated P&L).

### 2.5 Zero-Cost CI/CD Infrastructure
- Fully hosted on **GitHub Actions**.
- Scheduled Cron jobs trigger the analysis sequence at 9:15 AM IST and the evaluation sequence at 3:30 PM IST every weekday.
- Automatically pushes state updates back to the `main` branch, ensuring the GitHub Pages React app is always synced with the latest market intelligence.

---

## 3. System Architecture & Tech Stack

- **Backend & Logic:** Python 3.13
- **Market Data:** `yfinance` library
- **AI / Intelligence:** `google-genai` (Gemini API)
- **Database:** Flat-file JSON storage (`tracker.json`)
- **Frontend UI:** React.js + Vite + Vanilla CSS
- **Deployment & Hosting:** GitHub Actions (Backend) + GitHub Pages (Frontend)
- **Alerting:** Telegram Bot API (`requests` library)

*(Refer to `system_architecture.md` for the visual flow of data between components).*

---

## 4. Constraints & Assumptions

1. **Market Hours:** The system assumes standard Indian Standard Time (IST) market hours (9:15 AM - 3:30 PM). Cron jobs on GitHub run in UTC and must be scheduled accordingly.
2. **API Rate Limits:** The system operates under the constraints of the Google Gemini free tier and Telegram API limits. Batching is utilized where necessary.
3. **Symbol Accuracy:** Yahoo Finance requires strict `.NS` suffixes for Indian stocks (e.g., `RELIANCE.NS`).
4. **Execution Liability:** The software explicitly provides signals for educational purposes only. It does not execute live trades via brokerage APIs. All UI and Telegram alerts prominently feature a financial disclaimer.

---

## 5. Future Enhancements (V2.0)
- **Brokerage Integration:** Connect to Zerodha/Upstox APIs for live trade execution.
- **Advanced Technicals:** Integrate MACD, RSI, and Bollinger Bands into the AI context prompt.
- **Dynamic Risk Management:** Automatically adjust Stop Loss trailing based on market volatility (VIX).
