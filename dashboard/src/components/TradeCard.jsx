import React from 'react';

const TradeCard = ({ trade }) => {
  const signal = trade.signal || {};
  
  const isBuy = signal.buy_or_sell === 'BUY';
  const badgeClass = isBuy ? 'badge buy' : 'badge sell';
  
  return (
    <div className="trade-card">
      <div className="card-header">
        <span className="stock-name">{trade.stock}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {trade.status === 'PENDING' && <span className="badge pending">PENDING</span>}
          {trade.status === 'WIN' && <span className="badge win">WIN</span>}
          {trade.status === 'LOSS' && <span className="badge loss">LOSS</span>}
          <span className={badgeClass}>{signal.buy_or_sell}</span>
        </div>
      </div>
      
      <div className="price-grid">
        <div className="price-item">
          <span className="price-label">Entry Price</span>
          <span className="price-value">₹{signal.entry_point}</span>
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
      
      <div className="date-footer">
        Generated: {trade.date} ({signal.type})
      </div>
    </div>
  );
};

export default TradeCard;
