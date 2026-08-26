# Share Market Bot - Production Architecture

This diagram illustrates how your entire quantitative trading firm operates seamlessly in the cloud for free using GitHub Actions, Gemini AI, and GitHub Pages.

```mermaid
graph TD
    %% Define styles for nodes
    classDef github fill:#1e293b,stroke:#cbd5e1,stroke-width:2px,color:#fff;
    classDef external fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef bot fill:#065f46,stroke:#34d399,stroke-width:2px,color:#fff;
    classDef user fill:#86198f,stroke:#f0abfc,stroke-width:2px,color:#fff;
    classDef database fill:#7f1d1d,stroke:#fca5a5,stroke-width:2px,color:#fff;

    subgraph "Production Environment (GitHub)"
        Cron["⏱️ GitHub Actions Cron\n(9:15 AM & 3:30 PM)"]:::github
        PythonBot["🐍 Python Trading Bot\n(main.py)"]:::bot
        Tracker["🗄️ Database\n(tracker.json)"]:::database
        Pages["🌐 Web Hosting\n(GitHub Pages)"]:::github
        
        Cron -->|Triggers Schedule| PythonBot
        PythonBot -->|Saves Memory & Pushes| Tracker
        Tracker -.->|Raw JSON Fetch| Pages
    end

    subgraph "External APIs & Services"
        YF["📈 Yahoo Finance API"]:::external
        Gemini["🧠 Google Gemini 3.6 API"]:::external
        Telegram["📱 Telegram API"]:::external
    end

    subgraph "End User Access"
        TelegramApp["📲 Your Telegram App\n(Alerts & Reports)"]:::user
        Browser["💻 React Dashboard\n(UI & Analytics)"]:::user
    end

    %% Data Flow
    PythonBot -->|1. Downloads OHLCV Data| YF
    YF -->|2. Returns Market Data| PythonBot
    
    PythonBot -->|3. Sends Data & Indicators| Gemini
    Gemini -->|4. Returns BUY/SELL JSON| PythonBot

    PythonBot -->|5. Sends Formatted Alerts| Telegram
    Telegram -->|6. Instant Notification| TelegramApp

    Pages -->|Hosts React App| Browser
    Browser -->|Fetches Latest Data| Tracker
```

## How the pieces fit together:
1. **The Scheduler:** GitHub Actions wakes up the **Python Bot** every weekday at 9:15 AM (Analysis) and 3:30 PM (Evaluation).
2. **The Intelligence:** The bot pulls live market data from **Yahoo Finance** and passes it securely to **Google Gemini AI**.
3. **The Memory:** Once the AI makes a decision, the bot writes the trade to `tracker.json` and automatically commits this file back to your GitHub repository so it never forgets its history.
4. **The Alerts:** The bot immediately forwards the signals and accuracy reports to your phone via **Telegram**.
5. **The Interface:** When you open your web browser, the **React Dashboard** (hosted on GitHub Pages) reads the `tracker.json` file straight from the repository, generating a beautiful UI with your active trades and historical Analytics.
