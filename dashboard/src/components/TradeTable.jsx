import React from 'react';

const TradeTable = ({ trades, title }) => {
  if (trades.length === 0) {
    return <div className="empty-state">No {title.toLowerCase()} available.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      <table className="trade-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Stock</th>
            <th>Action</th>
            <th>Status</th>
            <th>Entry</th>
            <th>Target 1</th>
            <th>Stop Loss</th>
            <th>Exp. P&L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => {
            const signal = trade.signal || {};
            const isBuy = signal.buy_or_sell === 'BUY';
            const badgeClass = isBuy ? 'badge buy' : 'badge sell';
            
            let expectedPnL = 0;
            if (signal.entry_point > 0 && signal.target_1 > 0) {
              const diff = Math.abs(signal.target_1 - signal.entry_point);
              expectedPnL = ((diff / signal.entry_point) * 100).toFixed(2);
            }

            return (
              <tr key={index}>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{trade.date.split(' ')[0]}</td>
                <td style={{ fontWeight: 'bold' }}>{trade.stock.replace('.NS', '')}</td>
                <td><span className={badgeClass}>{signal.buy_or_sell}</span></td>
                <td>
                  {trade.status === 'PENDING' && <span className="badge pending">PENDING</span>}
                  {trade.status === 'WIN' && <span className="badge win">WIN</span>}
                  {trade.status === 'LOSS' && <span className="badge loss">LOSS</span>}
                </td>
                <td style={{ fontFamily: 'monospace' }}>₹{signal.entry_point}</td>
                <td style={{ fontFamily: 'monospace' }}>₹{signal.target_1}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>₹{signal.stop_loss}</td>
                <td style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>+{expectedPnL}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
