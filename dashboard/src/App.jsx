import React, { useState, useEffect } from 'react';
import ActiveTradeTable from './components/ActiveTradeTable';
import ReportsView from './components/ReportsView';

function App() {
  const [activeTab, setActiveTab] = useState('active');
  const [data, setData] = useState({ trades: [], last_updated: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Adding a timestamp to prevent browser caching of the raw JSON file
    const cacheBuster = new Date().getTime();
    fetch(`https://raw.githubusercontent.com/duraidigiinfolab/share-bot/main/tracker.json?t=${cacheBuster}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((jsonData) => {
        // jsonData is an array of trades
        const sortedTrades = (Array.isArray(jsonData) ? jsonData : []).sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        setData({ trades: sortedTrades, last_updated: new Date().toLocaleString() });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load market data. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Filter ONLY PENDING trades for the Active Setups dashboard
  const pendingTrades = data.trades.filter(t => t.status === 'PENDING');
  const intradayTrades = pendingTrades.filter(t => t.signal?.type === 'intraday');
  const longTermTrades = pendingTrades.filter(t => t.signal?.type === 'long term');

  return (
    <>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Algorithmic Quantitative Analysis</h1>
          {data.last_updated && <p>Last System Update: {data.last_updated}</p>}
        </header>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Setups
          </button>
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Analytics & Reports
          </button>
        </div>

        {loading ? (
          <div className="loading">Initializing trading engine...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="tab-content">
            {activeTab === 'active' ? (
              <>
                <ActiveTradeTable trades={intradayTrades} title="Intraday Setups" />
                <ActiveTradeTable trades={longTermTrades} title="Investment (Long Term) Setups" />
              </>
            ) : (
              <ReportsView trades={data.trades} />
            )}
          </div>
        )}
      </div>

      <footer className="dashboard-footer">
        <h3>⚠️ LEGAL & FINANCIAL DISCLAIMER (SEBI COMPLIANCE)</h3>
        <p>
          <strong>Not SEBI Registered:</strong> We are NOT registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor or Research Analyst. 
        </p>
        <p>
          <strong>Educational Purpose Only:</strong> This automated software, its dashboard, and all generated signals are intended strictly for educational, algorithmic testing, and paper-trading purposes. The data provided does not constitute financial advice, stock tips, or recommendations to buy/sell securities.
        </p>
        <p>
          <strong>No Liability:</strong> Equity trading involves substantial risk of loss. We accept no liability for any financial losses or damages incurred by using this algorithm. You are strongly advised to consult with a qualified, SEBI-registered financial advisor before making any real investment decisions.
        </p>
      </footer>
    </>
  );
}

export default App;
