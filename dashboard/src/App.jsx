import React, { useState, useEffect } from 'react';
import ActiveTradeTable from './components/ActiveTradeTable';
import ReportsView from './components/ReportsView';

function App() {
  const [activeTab, setActiveTab] = useState('active');
  const [data, setData] = useState({ trades: [], last_updated: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const cacheBuster = new Date().getTime();
    fetch(`https://raw.githubusercontent.com/duraidigiinfolab/share-bot/main/tracker.json?t=${cacheBuster}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((jsonData) => {
        const sortedTrades = (Array.isArray(jsonData) ? jsonData : []).sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        let lastUpdatedStr = 'Unknown';
        if (sortedTrades.length > 0) {
          lastUpdatedStr = new Date(sortedTrades[0].date).toLocaleString();
        }
        
        setData({ trades: sortedTrades, last_updated: lastUpdatedStr });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load market data. Please try again later.');
        setLoading(false);
      });
  }, []);

  const pendingTrades = data.trades.filter(t => t.status === 'PENDING');
  const intradayTrades = pendingTrades.filter(t => t.signal?.type === 'intraday');
  const longTermTrades = pendingTrades.filter(t => t.signal?.type === 'long term');

  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-hidden flex h-screen selection:bg-primary-container selection:text-white">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/10 blur-[100px]"></div>
      </div>

      {/* SideNavBar */}
      <nav className="group hidden md:flex flex-col bg-surface/80 backdrop-blur-2xl border-r border-surface-container-highest w-[72px] hover:w-52 transition-all duration-300 ease-in-out h-full z-40 shrink-0 overflow-visible relative">
        <div className="p-4 pt-6 w-52 absolute top-0 left-0 z-50 pointer-events-none">
          <div className="flex items-center gap-3 mb-8 pointer-events-auto">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>terminal</span>
            </div>
            <div className="shrink-0 drop-shadow-md">
              <h1 className="font-heading text-lg font-black text-on-surface tracking-tight leading-tight">DURA STOCK</h1>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase mt-0.5">Institutional Grade</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 overflow-hidden space-y-2 mt-24">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-3 px-3 py-3 w-[184px] rounded-lg font-heading text-xs uppercase transition-all duration-300 cursor-pointer whitespace-nowrap bg-surface shadow-sm hover:shadow-md ${activeTab === 'active' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-black/5 border-l-4 border-transparent'}`}
          >
            <span className="material-symbols-outlined text-sm shrink-0 ml-[2px]" style={activeTab === 'active' ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Active Setups</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-3 py-3 w-[184px] rounded-lg font-heading text-xs uppercase transition-all duration-300 cursor-pointer whitespace-nowrap bg-surface shadow-sm hover:shadow-md ${activeTab === 'reports' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-black/5 border-l-4 border-transparent'}`}
          >
            <span className="material-symbols-outlined text-sm shrink-0 ml-[2px]" style={activeTab === 'reports' ? {fontVariationSettings: "'FILL' 1"} : {}}>query_stats</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Analytics</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex bg-surface/80 backdrop-blur-xl sticky top-0 z-30 justify-between items-center px-4 md:px-8 h-16 shadow-sm border-b border-surface-container-highest ml-0 md:pl-40">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="font-heading text-xl font-bold text-primary tracking-tighter md:hidden">DURA STOCK</div>
            <div className="hidden md:block text-on-surface-variant text-sm">
              {data.last_updated && <span>Last System Update: {data.last_updated}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col">
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-64 text-primary animate-pulse">Initializing trading engine...</div>
            ) : error ? (
              <div className="glass-panel p-6 rounded-xl text-error text-center">{error}</div>
            ) : (
              <>
                {activeTab === 'active' ? (
                  <>
                    {/* Top Section: Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                          <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Total Active Signals</span>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">radar</span>
                        </div>
                        <div className="font-mono text-3xl font-bold text-on-surface">{pendingTrades.length}</div>
                      </div>
                      
                      <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex justify-between items-start">
                          <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Active Intraday</span>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">bolt</span>
                        </div>
                        <div className="font-mono text-3xl font-bold text-primary">{intradayTrades.length}</div>
                      </div>

                      <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex justify-between items-start">
                          <span className="font-heading text-xs text-on-surface-variant uppercase tracking-wider">Active Investment</span>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">trending_up</span>
                        </div>
                        <div className="font-mono text-3xl font-bold text-primary">{longTermTrades.length}</div>
                      </div>
                    </div>

                    {/* Tables */}
                    <ActiveTradeTable trades={intradayTrades} title="Intraday Setups" />
                    <ActiveTradeTable trades={longTermTrades} title="Investment (Long Term) Setups" />
                  </>
                ) : (
                  <ReportsView trades={data.trades} />
                )}
              </>
            )}
          </div>

          {/* Footer / SEBI Disclaimer */}
          <footer className="mt-8 pt-8 border-t border-surface-container-highest text-on-surface-variant text-xs leading-relaxed opacity-70 hover:opacity-100 transition-opacity">
            <h3 className="text-error font-heading uppercase mb-3 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[16px]">warning</span> 
              LEGAL & FINANCIAL DISCLAIMER (SEBI COMPLIANCE)
            </h3>
            <div className="space-y-2">
              <p>
                <strong className="text-on-surface">Not SEBI Registered:</strong> We are NOT registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor or Research Analyst.
              </p>
              <p>
                <strong className="text-on-surface">Educational Purpose Only:</strong> This automated software, its dashboard, and all generated signals are intended strictly for educational, algorithmic testing, and paper-trading purposes. The data provided does not constitute financial advice, stock tips, or recommendations to buy/sell securities.
              </p>
              <p>
                <strong className="text-on-surface">No Liability:</strong> Equity trading involves substantial risk of loss. We accept no liability for any financial losses or damages incurred by using this algorithm. You are strongly advised to consult with a qualified, SEBI-registered financial advisor before making any real investment decisions.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
