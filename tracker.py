import json
import os
import yfinance as yf
from datetime import datetime, timedelta

TRACKER_FILE = "tracker.json"

def load_tracker():
    if not os.path.exists(TRACKER_FILE):
        return []
    with open(TRACKER_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

def save_tracker(data):
    with open(TRACKER_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def add_signal(stock_symbol, signal_data):
    """Saves a new signal from the bots into the tracker database."""
    if not signal_data or signal_data.get("buy_or_sell") == "HOLD":
        return
        
    data = load_tracker()
    
    entry = {
        "id": str(datetime.now().timestamp()),
        "stock": stock_symbol,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "PENDING", # PENDING, WIN, LOSS, EXPIRED
        "signal": signal_data
    }
    data.append(entry)
    save_tracker(data)

def get_signal_count(trade_type, timeframe):
    """
    Returns the number of signals generated for a specific type and timeframe.
    timeframe: "today" or "this_week"
    """
    data = load_tracker()
    count = 0
    now = datetime.now()
    
    for entry in data:
        if entry.get("signal", {}).get("type") != trade_type:
            continue
            
        date_str = entry.get("date")
        if not date_str:
            continue
            
        signal_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
        
        if timeframe == "today" and signal_date == now.date():
            count += 1
        elif timeframe == "this_week":
            # Check if it falls in the current calendar week (Monday to Sunday)
            start_of_week = (now - timedelta(days=now.weekday())).date()
            if signal_date >= start_of_week:
                count += 1
                
    return count

def get_weekly_accuracy():
    """
    Calculates the bot's accuracy (win rate) for trades closed in the last 7 days.
    """
    data = load_tracker()
    now = datetime.now()
    seven_days_ago = (now - timedelta(days=7)).date()
    
    wins = 0
    losses = 0
    
    for entry in data:
        status = entry.get("status")
        if status not in ["WIN", "LOSS"]:
            continue
            
        date_str = entry.get("date")
        if not date_str:
            continue
            
        signal_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
        
        if signal_date >= seven_days_ago:
            if status == "WIN":
                wins += 1
            else:
                losses += 1
                
    total = wins + losses
    if total == 0:
        return 0.0
        
    return round((wins / total) * 100, 2)

def evaluate_signals():
    """
    Checks all PENDING signals against current market prices.
    Returns a list of completed trades to send in the Telegram Report.
    """
    data = load_tracker()
    reports = []
    
    for entry in data:
        if entry["status"] != "PENDING":
            continue
            
        stock = entry["stock"]
        signal = entry["signal"]
        trade_type = signal["type"]
        date_str = entry["date"]
        
        signal_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
        today = datetime.now().date()
        now = datetime.now()
        
        # Get current price
        try:
            ticker = yf.Ticker(stock)
            current_price = ticker.fast_info['lastPrice']
        except:
            continue
            
        buy_sell = signal["buy_or_sell"]
        sl = signal["stop_loss"]
        t1 = signal["target_1"]
        t2 = signal["target_2"]
        t3 = signal["target_3"]
        entry_price = signal["entry_point"]
        
        # Time Expiration Logic
        is_expired = False
        if trade_type == "intraday":
            if signal_date < today:
                is_expired = True
            elif signal_date == today and (now.hour > 15 or (now.hour == 15 and now.minute >= 30)):
                is_expired = True
        elif trade_type == "long term":
            # Default to closing after 90 days if target not hit
            if (today - signal_date).days > 90:
                is_expired = True
                
        # Target/SL Hit Logic
        hit_status = None
        if buy_sell == "BUY":
            if current_price <= sl:
                hit_status = "LOSS"
            elif current_price >= t1:
                hit_status = "WIN"
        elif buy_sell == "SELL":
            if current_price >= sl:
                hit_status = "LOSS"
            elif current_price <= t1:
                hit_status = "WIN"
                
        # Calculate Actual P&L
        actual_pnl = 0
        if buy_sell == "BUY":
            actual_pnl = ((current_price - entry_price) / entry_price) * 100
        elif buy_sell == "SELL":
            actual_pnl = ((entry_price - current_price) / entry_price) * 100
            
        # Determine Final Status
        if hit_status or is_expired:
            final_status = hit_status
            if is_expired and not hit_status:
                # If time expired, decide win/loss based on whether P&L is positive
                final_status = "WIN" if actual_pnl > 0 else "LOSS"
                
            entry["status"] = final_status
            entry["actual_pnl"] = round(actual_pnl, 2)
            
            reason = "Target/SL Hit" if hit_status else "Time Expired"
            reports.append(f"✅ Trade Closed: {stock} ({trade_type}) - Result: {final_status} ({round(actual_pnl, 2)}%) [{reason}]")
            
    save_tracker(data)
    return reports

if __name__ == "__main__":
    # Test tracking
    add_signal("RELIANCE.NS", {
        "buy_or_sell": "BUY",
        "type": "intraday",
        "entry_point": 2900,
        "target_1": 2950,
        "target_2": 3000,
        "target_3": 3100,
        "stop_loss": 2850
    })
    print(evaluate_signals())
