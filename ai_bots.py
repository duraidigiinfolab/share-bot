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

def get_batch_trading_signals(batch_text_data, trade_type):
    """
    Asks Gemini to analyze a huge block of multiple stocks and output a JSON array of the best trades.
    trade_type: 'intraday' or 'long term'
    """
    if not client:
        print("Gemini client not initialized. Check GEMINI_API_KEY.")
        return []
        
    system_prompt = f"""
You are an expert quantitative trader analyzing a batch of NSE stocks.
You will be provided with a large text block containing the 10-day historical trend (Price, RSI, MACD), fundamental data, and recent news for MULTIPLE stocks.

CRITICAL RULES FOR ANALYSIS:
1. Carefully analyze the 10-Day Historical Trend table for EVERY stock provided. Look for momentum shifts, consecutive higher highs, or RSI/MACD crossovers.
2. Filter out weak or sideways stocks. Pick only the absolute BEST setups (maximum 5).
3. For the chosen stocks, determine exact Targets (Target 1, Target 2, Target 3) and a Stop Loss based on the historical support and resistance levels visible in their 10-day High/Low prices, combined with their current Volatility (ATR).
4. Set entry_point exactly to the Current Price (the most recent Close price in the table).

Return the response STRICTLY as a valid JSON ARRAY of objects. Even if there is only 1 trade, it must be inside an array `[]`. If no stocks are good, return `[]`.
Schema for each object in the array:
[{{
    "stock": "SYMBOL.NS", // The stock ticker symbol
    "buy_or_sell": "BUY",  // or "SELL"
    "type": "{trade_type}",
    "time_period": "{'1 Day' if trade_type == 'intraday' else '3-6 Months'}",
    "open_price": 0.0,
    "entry_point": 0.0,
    "target_1": 0.0,
    "target_2": 0.0,
    "target_3": 0.0,
    "stop_loss": 0.0,
    "reasoning": "Explain your analysis of the 10-day trend and why you chose these specific targets."
}}]
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=batch_text_data,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        
        result = json.loads(response.text)
        if isinstance(result, list):
            return result
        elif isinstance(result, dict):
            # Fallback if AI wraps it in an object instead of array
            return [result]
        return []
        
    except Exception as e:
        print(f"Error generating AI batch signal: {e}")
        return []

def analyze_batch(intraday_batch_text, longterm_batch_text):
    """Generates both intraday and long-term batch signals."""
    intraday_signals = []
    long_term_signals = []
    
    if intraday_batch_text:
        print("Running AI Batch Analysis for Intraday...")
        intraday_signals = get_batch_trading_signals(intraday_batch_text, "intraday")
        
    if longterm_batch_text:
        print("Running AI Batch Analysis for Investment...")
        long_term_signals = get_batch_trading_signals(longterm_batch_text, "long term")
    
    return intraday_signals, long_term_signals

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
