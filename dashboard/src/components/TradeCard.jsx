import React, { useState } from 'react';

const TradeCard = ({ trade }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const signal = trade.signal || {};
  
  const isBuy = signal.buy_or_sell === 'BUY';
  const badgeClass = isBuy ? 'badge buy' : 'badge sell';
  
  // Calculate expected P&L % based on Target 1
  let expectedPnL = 0;
  if (signal.entry_point > 0 && signal.target_1 > 0) {
    const diff = Math.abs(signal.target_1 - signal.entry_point);
    expectedPnL = ((diff / signal.entry_point) * 100).toFixed(2);
  }
  
  return (
    <div 
      className="trade-card" 
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header">
        <span className="stock-name">{trade.stock.replace('.NS', '')}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {trade.status === 'PENDING' && <span className="badge pending">PENDING</span>}
          {trade.status === 'WIN' && <span className="badge win">WIN</span>}
          {trade.status === 'LOSS' && <span className="badge loss">LOSS</span>}
          <span className={badgeClass}>{signal.buy_or_sell}</span>
        </div>
      </div>
      
      <div className="price-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="price-item">
          <span className="price-label">Entry</span>
          <span className="price-value">₹{signal.entry_point}</span>
        </div>
        <div className="price-item">
          <span className="price-label">Exp. P&L</span>
          <span className="price-value" style={{ color: 'var(--accent-green)' }}>
            +{expectedPnL}%
          </span>
        </div>
        <div className="price-item">
          <span className="price-label">Stop Loss</span>
          <span className="price-value" style={{ color: 'var(--accent-red)' }}>₹{signal.stop_loss}</span>
        </div>
      </div>
      
      <div className="targets">
        <span className="price-label">Targets</span>
        <div className="targets-list">
          <span className="target-pill">T1: ₹{signal.target_1}</span>
          <span className="target-pill">T2: ₹{signal.target_2}</span>
          <span className="target-pill">T3: ₹{signal.target_3}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="detailed-report" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Detailed Report</h4>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
            {signal.reasoning || "No detailed reasoning provided by the AI for this trade."}
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Time Horizon:</strong> {signal.time_period || "N/A"}
          </div>
        </div>
      )}
      
      <div className="date-footer">
        Generated: {trade.date} ({signal.type}) {isExpanded ? '▲' : '▼'}
      </div>
    </div>
  );
};

export default TradeCard;
