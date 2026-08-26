import React from 'react';
import TradeCard from './TradeCard';

const ReportsView = ({ trades }) => {
  // Only process completed trades for the report
  const completedTrades = trades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
  
  const wins = completedTrades.filter(t => t.status === 'WIN').length;
  const losses = completedTrades.filter(t => t.status === 'LOSS').length;
  const total = wins + losses;
  
  const accuracy = total === 0 ? 0 : Math.round((wins / total) * 100);
  
  // Estimate Net P&L%
  // Assuming WIN = Target 1 hit, LOSS = Stop Loss hit
  let estimatedPnL = 0;
  
  completedTrades.forEach(trade => {
    const entry = parseFloat(trade.signal?.entry_point || 0);
    const stopLoss = parseFloat(trade.signal?.stop_loss || 0);
    const target1 = parseFloat(trade.signal?.target_1 || 0);
    const isBuy = trade.signal?.buy_or_sell === 'BUY';
    
    if (entry > 0) {
      if (trade.status === 'WIN' && target1 > 0) {
        const diff = Math.abs(target1 - entry);
        estimatedPnL += (diff / entry) * 100;
      } else if (trade.status === 'LOSS' && stopLoss > 0) {
        const diff = Math.abs(entry - stopLoss);
        estimatedPnL -= (diff / entry) * 100;
      }
    }
  });

  return (
    <div className="reports-view">
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="analytics-title">Total Completed Trades</div>
          <div className="analytics-value">{total}</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-title">Bot Accuracy (Win Rate)</div>
          <div className="analytics-value" style={{ color: accuracy >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {accuracy}%
          </div>
          <div className="analytics-subtitle">{wins} Wins / {losses} Losses</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-title">Estimated Net P&L</div>
          <div className="analytics-value" style={{ color: estimatedPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {estimatedPnL >= 0 ? '+' : ''}{estimatedPnL.toFixed(2)}%
          </div>
          <div className="analytics-subtitle">Based on hitting Target 1 or Stop Loss</div>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 className="section-title">
          <span style={{ color: 'var(--text-primary)' }}>📊</span> Trade History Log
        </h2>
        {completedTrades.length === 0 ? (
          <div className="empty-state">No completed trades available yet.</div>
        ) : (
          <div className="dashboard-grid">
            {completedTrades.map((trade, index) => (
              <TradeCard key={`report-${index}`} trade={trade} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReportsView;
