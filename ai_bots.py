import os
import json
import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# We expect GEMINI_API_KEY to be in .env
try:
    client = genai.Client()
except Exception as e:
    client = None
    print(f"Failed to initialize Gemini Client: {e}")

def get_trading_signal(stock_text_data, trade_type):
    """
    Asks Gemini to analyze the stock data and output a JSON signal.
    trade_type: 'intraday' or 'long term'
    """
    if not client:
        print("Gemini client not initialized. Check GEMINI_API_KEY.")
        return None
        
    system_prompt = f"""
You are an expert quantitative trader analyzing NSE stocks.
Analyze the provided technical indicators and recent news.
Determine if the stock is a BUY, SELL, or HOLD for {trade_type} trading.
If it is a BUY or SELL, provide realistic Entry Point, Target 1, Target 2, Target 3, and Stop Loss based on the current price and volatility.
If the technicals are mixed or weak, output HOLD and 0 for prices.

Return the response STRICTLY as a valid JSON object with the following schema:
{{
    "buy_or_sell": "BUY",  // or "SELL" or "HOLD"
    "type": "{trade_type}",
    "time_period": "{'1 Day' if trade_type == 'intraday' else '3-6 Months'}",
    "open_price": 0.0,
    "entry_point": 0.0,
    "target_1": 0.0,
    "target_2": 0.0,
    "target_3": 0.0,
    "stop_loss": 0.0,
    "reasoning": "Short 1 sentence explanation"
}}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=stock_text_data,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2 # low temp for more analytical responses
            )
        )
        
        # Parse JSON
        result = json.loads(response.text)
        return result
        
    except Exception as e:
        print(f"Error generating AI signal: {e}")
        return None

def analyze_stock(stock_symbol, stock_text_data, run_intraday=True, run_longterm=True):
    """Generates both intraday and long-term signals for a stock, skipping if quotas are met."""
    intraday_signal = None
    long_term_signal = None
    
    if run_intraday:
        print(f"Running Intraday Bot for {stock_symbol}...")
        intraday_signal = get_trading_signal(stock_text_data, "intraday")
        
    if run_longterm:
        print(f"Running Investment Bot for {stock_symbol}...")
        long_term_signal = get_trading_signal(stock_text_data, "long term")
    
    return intraday_signal, long_term_signal

if __name__ == "__main__":
    # Test script with dummy data
    dummy_data = """
Stock: RELIANCE.NS
Current Price: 2950.0
Previous Price: 2930.0
Volume: 5000000

Technical Indicators:
- RSI (14): 65.5
- MACD (12, 26): 12.5 (Signal: 10.0)
- SMA 20: 2900.0
- SMA 50: 2850.0
- SMA 200: 2700.0

Recent News Headlines:
- Reliance signs new green energy deal.
- Jio profits rise by 12%.
"""
    i, l = analyze_stock("RELIANCE.NS", dummy_data)
    print("Intraday:", i)
    print("Long Term:", l)
