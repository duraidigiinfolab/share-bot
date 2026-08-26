import React, { useState } from 'react';

const companyNames = {
  'RELIANCE': 'Reliance Industries Ltd',
  'TCS': 'Tata Consultancy Services Ltd',
  'HDFCBANK': 'HDFC Bank Limited',
  'ICICIBANK': 'ICICI Bank Ltd',
  'INFY': 'Infosys Ltd',
  'SBIN': 'State Bank of India',
  'BHARTIARTL': 'Bharti Airtel Ltd',
  'ITC': 'ITC Ltd',
  'LT': 'Larsen & Toubro Ltd',
  'BAJFINANCE': 'Bajaj Finance Ltd'
};

const ActiveTradeTable = ({ trades, title }) => {
  const [expandedRows, setExpandedRows] = useState({});

  if (trades.length === 0) {
    return <div className="glass-panel text-center p-12 text-on-surface-variant rounded-xl border-dashed border-slate-200 mb-8">No active {title.toLowerCase()} available.</div>;
  }

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getPnl = (entry, target) => {
    if (!entry || !target) return '0.00';
    return ((Math.abs(target - entry) / entry) * 100).toFixed(2);
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col overflow-hidden mb-8">
      <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-surface">
        <h2 className="font-heading text-lg text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {title.includes('Intraday') ? 'bolt' : 'trending_up'}
          </span>
          {title}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 font-heading text-[11px] text-on-surface-variant uppercase tracking-wider bg-slate-50">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium min-w-[220px]">Stock</th>
              <th className="px-4 py-3 font-medium">Open Price</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entry Price</th>
              <th className="px-4 py-3 font-medium">T1 <span className="opacity-50 text-[10px]">(P&L)</span></th>
              <th className="px-4 py-3 font-medium">T2 <span className="opacity-50 text-[10px]">(P&L)</span></th>
              <th className="px-4 py-3 font-medium">T3 <span className="opacity-50 text-[10px]">(P&L)</span></th>
              <th className="px-4 py-3 font-medium text-right">Stop Loss</th>
              <th className="px-4 py-3 font-medium">Time Period</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {trades.map((trade, index) => {
              const signal = trade.signal || {};
              const isBuy = signal.buy_or_sell === 'BUY';
              const isExpanded = expandedRows[index];
              const symbol = trade.stock.replace('.NS', '');
              const fullName = companyNames[symbol] || symbol;

              return (
                <React.Fragment key={index}>
                  <tr onClick={() => toggleRow(index)} className="border-b border-slate-100 table-row-hover transition-colors cursor-pointer group hover:bg-slate-50">
                    <td className="px-4 py-4 text-on-surface-variant">{trade.date.split(' ')[0]}</td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isBuy ? 'bg-primary/10 border-primary/20' : 'bg-error/10 border-error/20'}`}>
                          <span className={`font-bold text-[10px] ${isBuy ? 'text-primary' : 'text-error'}`}>
                            {symbol.substring(0,3)}
                          </span>
                        </div>
                        <div>
                          <div className="text-on-surface font-semibold group-hover:text-primary transition-colors">{fullName}</div>
                          <div className="font-heading text-[10px] text-on-surface-variant uppercase flex items-center gap-1">
                            ({symbol})
                            <span className="material-symbols-outlined text-[14px]">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-on-surface-variant">{signal.open_price ? `₹${signal.open_price}` : 'N/A'}</td>
                    
                    <td className="px-4 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded border font-heading text-[10px] uppercase tracking-wider ${isBuy ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                          {signal.buy_or_sell}
                       </span>
                    </td>
                    
                    <td className="px-4 py-4">
                       <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-on-surface font-bold">
                         ₹{signal.entry_point}
                       </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="text-on-surface-variant group-hover:text-on-surface transition-colors">₹{signal.target_1}</div>
                      <div className="text-primary text-xs">+{getPnl(signal.entry_point, signal.target_1)}%</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-on-surface-variant group-hover:text-on-surface transition-colors">₹{signal.target_2}</div>
                      <div className="text-primary text-xs">+{getPnl(signal.entry_point, signal.target_2)}%</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-on-surface-variant group-hover:text-on-surface transition-colors">₹{signal.target_3}</div>
                      <div className="text-primary text-xs">+{getPnl(signal.entry_point, signal.target_3)}%</div>
                    </td>
                    
                    <td className="px-4 py-4 text-right text-error font-bold">
                       ₹{signal.stop_loss}
                    </td>
                    
                    <td className="px-4 py-4 text-on-surface-variant text-xs">{signal.time_period || 'N/A'}</td>
                    
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-heading text-[10px] uppercase tracking-wider">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                         PENDING
                      </span>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan="11" className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-primary font-heading text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            AI Detailed Report
                          </span>
                          <span className="text-sm text-on-surface font-body leading-relaxed max-w-4xl">
                            {signal.reasoning || "No detailed reasoning provided by the AI for this trade."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveTradeTable;
