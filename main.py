import schedule
import time
import os
import requests
import datetime
from dotenv import load_dotenv

import data_engine
import ai_bots
import tracker

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram(msg):
    if not TELEGRAM_BOT_TOKEN:
        print("Telegram token missing.")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload)
    except Exception as e:
        print(f"Telegram Error: {e}")

def format_signal_message(stock, signal):
    icon = "🟢 BUY" if signal['buy_or_sell'] == "BUY" else "🔴 SELL"
    msg = f"📊 *{stock}* | {signal['type'].upper()} SIGNAL\n\n"
    msg += f"**Action:** {icon}\n"
    msg += f"**Time Period:** {signal['time_period']}\n"
    msg += f"**Entry Point:** ₹{signal['entry_point']}\n\n"
    msg += f"🎯 Target 1: ₹{signal['target_1']}\n"
    msg += f"🎯 Target 2: ₹{signal['target_2']}\n"
    msg += f"🎯 Target 3: ₹{signal['target_3']}\n\n"
    msg += f"🛑 Stop Loss: ₹{signal['stop_loss']}\n\n"
    msg += f"💡 *Reasoning:* {signal.get('reasoning', '')}"
    return msg

def is_market_open_today():
    today = datetime.datetime.now()
    if today.weekday() >= 5: # 5=Sat, 6=Sun
        return False
        
    # NSE 2026 Trading Holidays
    nse_holidays_2026 = [
        "2026-01-26", # Republic Day
        "2026-03-03", # Holi
        "2026-03-26", # Shri Ram Navami
        "2026-03-31", # Mahavir Jayanti
        "2026-04-03", # Good Friday
        "2026-04-14", # Dr. Ambedkar Jayanti
        "2026-05-01", # Maharashtra Day
        "2026-05-28", # Bakri Id
        "2026-06-26", # Muharram
        "2026-09-14", # Ganesh Chaturthi
        "2026-10-02", # Mahatma Gandhi Jayanti
        "2026-10-20", # Dussehra
        "2026-11-10", # Diwali-Balipratipada
        "2026-11-24", # Prakash Gurpurb
        "2026-12-25"  # Christmas
    ]
    
    today_str = today.strftime("%Y-%m-%d")
    if today_str in nse_holidays_2026:
        print(f"Market is closed today for a public holiday: {today_str}")
        return False
        
    return True

def run_morning_analysis():
    """Runs at Market Open to generate new signals."""
    if not is_market_open_today():
        print("Market is closed today.")
        return
        
    print("Running Morning Analysis...")
    
    accuracy = tracker.get_weekly_accuracy()
    
    msg = (
        "🌅 *Market Open!* Analyzing top stocks...\n\n"
        f"🎯 *Past 7 Days Accuracy:* {accuracy}%\n"
        "📊 *Live Dashboard:* [View Reports](https://dura-share.vercel.app/)\n\n"
        "⚠️ *SEBI Disclaimer:* Not a SEBI registered analyst. Signals are algorithmically generated for educational & paper-trading purposes only. Not financial advice."
    )
    send_telegram(msg)
    
    # Get Nifty 500 and run through Python Pre-Screener
    tickers = data_engine.get_nifty500_tickers()
    filtered_tickers = data_engine.screen_stocks(tickers)
    
    if not filtered_tickers:
        send_telegram("No high-probability setups found by the screener today.")
        return
        
    send_telegram(f"🔍 Pre-screener found {len(filtered_tickers)} high-probability stocks out of {len(tickers)}. Compiling data for AI Batch Analysis...")
    
    intraday_batch_texts = []
    longterm_batch_texts = []
    
    for ticker in filtered_tickers:
        news = data_engine.get_latest_news(ticker)
        
        # Intra
        intra_data = data_engine.fetch_stock_data(ticker, period="5d", interval="15m")
        if intra_data:
            intraday_batch_texts.append(data_engine.format_data_for_ai(intra_data, news))
            
        # Long
        long_data = data_engine.fetch_stock_data(ticker, period="6mo", interval="1d")
        if long_data:
            longterm_batch_texts.append(data_engine.format_data_for_ai(long_data, news))
            
    # Combine into massive strings
    intraday_combined = "\n\n==========================\n\n".join(intraday_batch_texts)
    longterm_combined = "\n\n==========================\n\n".join(longterm_batch_texts)
    
    send_telegram("🤖 Sending batch data to Gemini AI...")
    
    # 1 Single API call for Intraday, 1 for Long Term
    intraday_signals, longterm_signals = ai_bots.analyze_batch(intraday_combined, longterm_combined)
    
    total_signals = len(intraday_signals) + len(longterm_signals)
    if total_signals == 0:
        send_telegram("AI evaluated all stocks but found 0 valid setups.")
        return
        
    # Process Intraday Signals (it's an array now)
    for signal in intraday_signals:
        if signal.get("buy_or_sell") in ["BUY", "SELL"]:
            stock = signal.get("stock", "UNKNOWN")
            tracker.add_signal(stock, signal)
            send_telegram(format_signal_message(stock, signal))
            
    # Process Long Term Signals
    for signal in longterm_signals:
        if signal.get("buy_or_sell") in ["BUY", "SELL"]:
            stock = signal.get("stock", "UNKNOWN")
            tracker.add_signal(stock, signal)
            send_telegram(format_signal_message(stock, signal))

def run_evening_evaluation():
    """Runs at Market Close to verify if previous signals hit targets."""
    if not is_market_open_today():
        return
        
    print("Running Evening Evaluation...")
    reports = tracker.evaluate_signals()
    
    if reports:
        msg = "📉 *Market Closed! Accuracy Report:*\n\n" + "\n".join(reports)
        send_telegram(msg)
    else:
        send_telegram("📉 *Market Closed!* No pending trades were completed today.")

if __name__ == "__main__":
    import sys
    
    # If triggered by GitHub Actions
    if len(sys.argv) > 1:
        if sys.argv[1] == "--morning":
            run_morning_analysis()
        elif sys.argv[1] == "--evening":
            run_evening_evaluation()
        sys.exit(0)
        
    # Local continuous testing mode
    print("Share Market Bot is running! Waiting for schedules...")
    
    schedule.every().day.at("09:15").do(run_morning_analysis)
    schedule.every().day.at("15:30").do(run_evening_evaluation)
    
    # Uncomment to test instantly locally:
    run_morning_analysis()
    run_evening_evaluation()
    
    while True:
        schedule.run_pending()
        time.sleep(60)
