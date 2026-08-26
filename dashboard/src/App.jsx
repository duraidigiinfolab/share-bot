import React, { useState, useEffect } from 'react';
import TradeCard from './components/TradeCard';
import ReportsView from './components/ReportsView';

function App() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Fetch directly from the raw GitHub file so it always shows the latest trades!
    // Added a cache-busting query parameter so browsers don't cache old data
    const fetchTrades = async () => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/duraidigiinfolab/share-bot/main/tracker.json?t=${new Date().getTime()}`
        );
        if (!response.ok) throw new Error('Failed to fetch trades');
        const data = await response.json();
        // Sort by date descending (newest first)
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrades(sortedData);
      } catch (error) {
        console.error("Error fetching tracker.json:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  if (loading) {
    return <div className="loader">Loading Market Intelligence...</div>;
  }

  // Split trades into Intraday and Investment
  const intradayTrades = trades.filter(t => t.signal?.type === 'intraday');
  const investmentTrades = trades.filter(t => t.signal?.type === 'long term');

  return (
    <>
      <header>
        <h1>Trade Terminal</h1>
        <p className="subtitle">Algorithmic Quantitative Analysis</p>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
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
      </header>

      {activeTab === 'dashboard' ? (
        <div className="dashboard-grid">
          <section>
            <h2 className="section-title">
              <span style={{ color: 'var(--accent-blue)' }}>⚡</span> Intraday Setups
            </h2>
            {intradayTrades.length === 0 ? (
              <div className="empty-state">No intraday trades available.</div>
            ) : (
              intradayTrades.map((trade, index) => (
                <TradeCard key={`intra-${index}`} trade={trade} />
              ))
            )}
          </section>

          <section>
            <h2 className="section-title">
              <span style={{ color: 'var(--accent-green)' }}>📈</span> Investment (Long Term)
            </h2>
            {investmentTrades.length === 0 ? (
              <div className="empty-state">No investment trades available.</div>
            ) : (
              investmentTrades.map((trade, index) => (
                <TradeCard key={`invest-${index}`} trade={trade} />
              ))
            )}
          </section>
        </div>
      ) : (
        <ReportsView trades={trades} />
      )}

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
