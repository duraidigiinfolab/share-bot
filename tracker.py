import json
import os
import yfinance as yf
from datetime import datetime

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
        
        # Check if Intraday expired
        signal_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
        today = datetime.now().date()
        
        is_expired = False
        if trade_type == "intraday" and signal_date < today:
            is_expired = True
            
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
        
        hit_status = None
        
        if buy_sell == "BUY":
            if current_price <= sl:
                hit_status = "LOSS (Stop Loss Hit)"
            elif current_price >= t3:
                hit_status = "WIN (Target 3 Hit!)"
            elif current_price >= t2:
                hit_status = "WIN (Target 2 Hit!)"
            elif current_price >= t1:
                hit_status = "WIN (Target 1 Hit!)"
        elif buy_sell == "SELL":
            if current_price >= sl:
                hit_status = "LOSS (Stop Loss Hit)"
            elif current_price <= t3:
                hit_status = "WIN (Target 3 Hit!)"
            elif current_price <= t2:
                hit_status = "WIN (Target 2 Hit!)"
            elif current_price <= t1:
                hit_status = "WIN (Target 1 Hit!)"
                
        if hit_status:
            entry["status"] = hit_status
            reports.append(f"✅ Trade Closed: {stock} ({trade_type}) - Result: {hit_status}")
        elif is_expired:
            entry["status"] = "EXPIRED"
            reports.append(f"⏱️ Trade Expired: {stock} ({trade_type}) did not hit targets today.")
            
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
