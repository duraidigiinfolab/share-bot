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
    # TODO: Add NSE holiday calendar check here
    return True

def run_morning_analysis():
    """Runs at Market Open to generate new signals."""
    if not is_market_open_today():
        print("Market is closed today.")
        return
        
    print("Running Morning Analysis...")
    send_telegram("🌅 *Market Open!* Analyzing top stocks for trading opportunities...")
    
    tickers = data_engine.get_nifty50_tickers()
    
    for ticker in tickers:
        stock_data = data_engine.fetch_stock_data(ticker)
        if not stock_data: continue
            
        news = data_engine.get_latest_news(ticker)
        ai_prompt_text = data_engine.format_data_for_ai(stock_data, news)
        
        intraday, longterm = ai_bots.analyze_stock(ticker, ai_prompt_text)
        
        # Process Intraday
        if intraday and intraday.get("buy_or_sell") in ["BUY", "SELL"]:
            tracker.add_signal(ticker, intraday)
            send_telegram(format_signal_message(ticker, intraday))
            
        # Process Long Term
        if longterm and longterm.get("buy_or_sell") in ["BUY", "SELL"]:
            tracker.add_signal(ticker, longterm)
            send_telegram(format_signal_message(ticker, longterm))
            
        # Sleep to avoid hitting Gemini API rate limits
        time.sleep(2)

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
