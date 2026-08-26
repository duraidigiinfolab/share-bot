import React from 'react';

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

const TradeTable = ({ trades, title }) => {
  if (trades.length === 0) {
    return <div className="glass-panel text-center p-12 text-on-surface-variant rounded-xl border-dashed border-slate-200 mb-8">No {title.toLowerCase()} available.</div>;
  }

  return (
    <div className="glass-panel rounded-xl flex flex-col overflow-hidden mb-8 mt-6">
      <div className="p-4 border-b border-slate-200 bg-surface">
        <h3 className="font-heading text-base text-on-surface">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 font-heading text-[11px] text-on-surface-variant uppercase tracking-wider bg-slate-50">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium min-w-[220px]">Stock</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Entry</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Stop Loss</th>
              <th className="px-4 py-3 font-medium">Achieved P&L</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {trades.map((trade, index) => {
              const signal = trade.signal || {};
              const isBuy = signal.buy_or_sell === 'BUY';
              
              let hitTarget = 'T1';
              let targetValue = signal.target_1;
              let achievedPnL = 0;

              if (trade.status !== 'PENDING') {
                if (trade.status.startsWith('WIN')) {
                  // Figure out hit target from old string format or use T1
                  if (trade.status.includes('Target 3')) {
                    hitTarget = 'T3';
                    targetValue = signal.target_3;
                  } else if (trade.status.includes('Target 2')) {
                    hitTarget = 'T2';
                    targetValue = signal.target_2;
                  }
                  
                  // If actual_pnl exists, we can accurately deduce which target was hit
                  if (trade.actual_pnl !== undefined) {
                    const t2PnL = (Math.abs(signal.target_2 - signal.entry_point) / signal.entry_point) * 100;
                    const t3PnL = (Math.abs(signal.target_3 - signal.entry_point) / signal.entry_point) * 100;
                    
                    if (trade.actual_pnl >= t3PnL) {
                      hitTarget = 'T3';
                      targetValue = signal.target_3;
                    } else if (trade.actual_pnl >= t2PnL) {
                      hitTarget = 'T2';
                      targetValue = signal.target_2;
                    } else {
                      hitTarget = 'T1';
                      targetValue = signal.target_1;
                    }
                  }
                  
                  // Calculate achieved PnL (use actual_pnl if available, else fallback to target math)
                  achievedPnL = trade.actual_pnl !== undefined 
                    ? trade.actual_pnl 
                    : (Math.abs(targetValue - signal.entry_point) / signal.entry_point) * 100;
                    
                } else {
                  // LOSS
                  achievedPnL = trade.actual_pnl !== undefined
                    ? trade.actual_pnl
                    : -((Math.abs(signal.stop_loss - signal.entry_point) / signal.entry_point) * 100);
                }
              }
              
              const symbol = trade.stock.replace('.NS', '');
              const fullName = companyNames[symbol] || symbol;

              return (
                <tr key={index} className="border-b border-slate-100 table-row-hover transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{trade.date.split(' ')[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isBuy ? 'bg-primary/10 border-primary/20' : 'bg-error/10 border-error/20'}`}>
                        <span className={`font-bold text-[10px] ${isBuy ? 'text-primary' : 'text-error'}`}>
                          {symbol.substring(0,3)}
                        </span>
                      </div>
                      <div>
                        <div className="text-on-surface font-semibold">{fullName}</div>
                        <div className="font-heading text-[10px] text-on-surface-variant uppercase flex items-center gap-1">
                          ({symbol})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded border font-heading text-[10px] uppercase tracking-wider ${isBuy ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                        {signal.buy_or_sell}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                    {trade.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-heading text-[10px] uppercase tracking-wider">
                        PENDING
                      </span>
                    )}
                    {trade.status !== 'PENDING' && trade.status.startsWith('WIN') && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-heading text-[10px] uppercase tracking-wider">
                        WIN
                      </span>
                    )}
                    {trade.status !== 'PENDING' && !trade.status.startsWith('WIN') && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-error/10 text-error border border-error/20 font-heading text-[10px] uppercase tracking-wider">
                        LOSS
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface font-bold">₹{signal.entry_point}</td>
                  <td className="px-4 py-3 text-on-surface">
                    <div>₹{targetValue}</div>
                    {trade.status !== 'PENDING' && trade.status.startsWith('WIN') ? (
                      <div className="text-[10px] text-primary mt-0.5">{hitTarget} Hit</div>
                    ) : (
                      <div className="text-[10px] text-on-surface-variant mt-0.5">T1</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-error font-bold">₹{signal.stop_loss}</td>
                  <td className={`px-4 py-3 font-bold ${trade.status === 'PENDING' ? 'text-on-surface-variant' : (achievedPnL > 0 ? 'text-primary' : 'text-error')}`}>
                    {trade.status === 'PENDING' ? '-' : `${achievedPnL > 0 ? '+' : ''}${achievedPnL.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;
