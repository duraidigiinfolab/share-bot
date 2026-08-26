import React from 'react';
import TradeTable from './TradeTable';

const ReportsView = ({ trades }) => {
  // Any trade that is not PENDING is considered completed.
  const completedTrades = trades.filter(t => t.status !== 'PENDING');
  
  const intradayTrades = trades.filter(t => t.signal?.type === 'intraday');
  const longTermTrades = trades.filter(t => t.signal?.type === 'long term');
  
  const wins = completedTrades.filter(t => t.status.startsWith('WIN')).length;
  const losses = completedTrades.filter(t => !t.status.startsWith('WIN')).length;
  const total = wins + losses;
  
  const accuracy = total === 0 ? 0 : Math.round((wins / total) * 100);
  
  let actualPnL = 0;
  
  completedTrades.forEach(trade => {
    if (trade.actual_pnl !== undefined) {
      actualPnL += trade.actual_pnl;
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Total Completed Trades</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">history</span>
          </div>
          <div className="font-mono text-3xl font-bold text-on-surface">{total}</div>
        </div>
        
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Bot Accuracy (Win Rate)</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">psychology</span>
          </div>
          <div className={`font-mono text-3xl font-bold ${accuracy >= 50 ? 'text-primary' : 'text-error'}`}>
            {accuracy}%
          </div>
          <div className="font-heading text-[10px] text-on-surface-variant uppercase">{wins} Wins / {losses} Losses</div>
        </div>

        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Actual Net P&L</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">account_balance</span>
          </div>
          <div className={`font-mono text-3xl font-bold ${actualPnL >= 0 ? 'text-primary' : 'text-error'}`}>
            {actualPnL >= 0 ? '+' : ''}{actualPnL.toFixed(2)}%
          </div>
          <div className="font-heading text-[10px] text-on-surface-variant uppercase">Based on closed trades</div>
        </div>
      </div>

      <section>
        {trades.length === 0 ? (
          <div className="glass-panel text-center p-12 text-on-surface-variant rounded-xl border-dashed border-slate-200">No trades available yet.</div>
        ) : (
          <>
            <TradeTable trades={intradayTrades} title="Intraday History" />
            <TradeTable trades={longTermTrades} title="Investment History" />
          </>
        )}
      </section>
    </div>
  );
};

export default ReportsView;
