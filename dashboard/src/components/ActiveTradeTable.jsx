import React, { useState } from 'react';

const ActiveTradeTable = ({ trades, title }) => {
  const [expandedRows, setExpandedRows] = useState({});

  if (trades.length === 0) {
    return <div className="empty-state" style={{ marginBottom: '2rem' }}>No active {title.toLowerCase()} available.</div>;
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
    <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
      <h2 className="section-title">
        {title.includes('Intraday') ? '⚡' : '📈'} {title}
      </h2>
      <table className="trade-table active-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Stock</th>
            <th>Open Price</th>
            <th>Action</th>
            <th>Action Price (Entry)</th>
            <th>T1 <span style={{fontSize: '0.8em', opacity: 0.7}}>(Exp. P&L)</span></th>
            <th>T2 <span style={{fontSize: '0.8em', opacity: 0.7}}>(Exp. P&L)</span></th>
            <th>T3 <span style={{fontSize: '0.8em', opacity: 0.7}}>(Exp. P&L)</span></th>
            <th>Stop Loss</th>
            <th>Time Period</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => {
            const signal = trade.signal || {};
            const isBuy = signal.buy_or_sell === 'BUY';
            const badgeClass = isBuy ? 'badge buy' : 'badge sell';
            const isExpanded = expandedRows[index];

            return (
              <React.Fragment key={index}>
                <tr onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-secondary)' }}>{trade.date.split(' ')[0]}</td>
                  <td style={{ fontWeight: 'bold' }}>{trade.stock.replace('.NS', '')} {isExpanded ? '▲' : '▼'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{signal.open_price ? `₹${signal.open_price}` : 'N/A'}</td>
                  <td><span className={badgeClass}>{signal.buy_or_sell}</span></td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>₹{signal.entry_point}</td>
                  
                  <td style={{ fontFamily: 'monospace' }}>
                    ₹{signal.target_1} <br/>
                    <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>+{getPnl(signal.entry_point, signal.target_1)}%</span>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    ₹{signal.target_2} <br/>
                    <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>+{getPnl(signal.entry_point, signal.target_2)}%</span>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    ₹{signal.target_3} <br/>
                    <span style={{ color: 'var(--accent-green)', fontSize: '0.85em' }}>+{getPnl(signal.entry_point, signal.target_3)}%</span>
                  </td>
                  
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>₹{signal.stop_loss}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{signal.time_period || 'N/A'}</td>
                  <td><span className="badge pending">PENDING</span></td>
                </tr>
                
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="11" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>AI Detailed Report</span>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{signal.reasoning || "No detailed reasoning provided by the AI for this trade."}</span>
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
  );
};

export default ActiveTradeTable;
