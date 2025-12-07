import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Building2,
  AlertCircle,
  Search,
  Bell,
  Users,
  Calculator,
  Settings,
  Home,
  Radio,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Star,
} from 'lucide-react';

const API_BASE = '/api';

export default function DealMind() {
  const [activeView, setActiveView] = useState('dashboard');
  const [companies, setCompanies] = useState([]);
  const [events, setEvents] = useState([]);
  const [dealWorkspaces, setDealWorkspaces] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const [companiesRes, eventsRes, workspacesRes] = await Promise.all([
        fetch(`${API_BASE}/companies`),
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/workspaces`),
      ]);

      if (!companiesRes.ok || !eventsRes.ok || !workspacesRes.ok) {
        throw new Error('API request failed');
      }

      const [companiesData, eventsData, workspacesData] = await Promise.all([
        companiesRes.json(),
        eventsRes.json(),
        workspacesRes.json(),
      ]);

      setCompanies(companiesData);
      setEvents(eventsData);
      setDealWorkspaces(workspacesData);
    } catch (err) {
      console.error(err);
      setError('Konnte Daten nicht laden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!watchlist.length && companies.length) {
      const defaults = companies
        .filter((company) => [1, 4].includes(company.id))
        .map((company) => company.id);

      if (defaults.length) {
        setWatchlist(defaults);
      }
    }
  }, [companies, watchlist.length]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = sectorFilter === 'All' || c.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [companies, searchQuery, sectorFilter]);

  const topTargets = useMemo(() => {
    return [...companies].sort((a, b) => b.dealProbTarget - a.dealProbTarget).slice(0, 5);
  }, [companies]);

  const topBuyers = useMemo(() => {
    return [...companies].sort((a, b) => b.dealProbBuyer - a.dealProbBuyer).slice(0, 5);
  }, [companies]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 6);
  }, [events]);

  const resetSelections = useCallback(() => {
    setSelectedCompany(null);
    setSelectedWorkspace(null);
  }, []);

  useEffect(() => {
    if (activeView !== 'company') {
      setSelectedCompany(null);
    }

    if (activeView !== 'workspace') {
      setSelectedWorkspace(null);
    }
  }, [activeView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto" />
          <div className="text-gray-700 font-medium">Daten werden geladen ...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div className="text-lg font-semibold text-gray-900">Fehler beim Laden</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => {
              resetSelections();
              loadData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">DealMind</h1>
              <p className="text-xs text-gray-400">Cognitive Deal Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={Home} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={Building2} label="Companies" active={activeView === 'companies'} onClick={() => setActiveView('companies')} />
          <NavItem icon={Briefcase} label="Deal Workspaces" active={activeView === 'workspaces'} onClick={() => setActiveView('workspaces')} />
          <NavItem icon={Radio} label="Signal Radar" active={activeView === 'radar'} onClick={() => setActiveView('radar')} />
          <NavItem icon={Calculator} label="Modeling Tools" active={activeView === 'modeling'} onClick={() => setActiveView('modeling')} />
          <NavItem icon={Star} label="Watchlist" badge={watchlist.length} active={activeView === 'watchlist'} onClick={() => setActiveView('watchlist')} />
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4" />
            <span>John Anderson</span>
          </div>
          <div>Associate, M&A</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies, tickers, or deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeView === 'dashboard' && (
            <Dashboard
              topTargets={topTargets}
              topBuyers={topBuyers}
              recentEvents={recentEvents}
              onViewCompany={(c) => {
                setSelectedCompany(c);
                setActiveView('company');
              }}
            />
          )}
          {activeView === 'companies' && (
            <CompaniesView
              companies={filteredCompanies}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
              onViewCompany={(c) => {
                setSelectedCompany(c);
                setActiveView('company');
              }}
            />
          )}
          {activeView === 'company' && selectedCompany && (
            <CompanyProfile
              company={selectedCompany}
              companies={companies}
              onBack={() => setActiveView('companies')}
              onCreateWorkspace={(buyer, target) => {
                setSelectedWorkspace({ buyer, target });
                setActiveView('workspace');
              }}
              watchlist={watchlist}
              setWatchlist={setWatchlist}
            />
          )}
          {activeView === 'workspaces' && (
            <WorkspacesView
              workspaces={dealWorkspaces}
              onViewWorkspace={(w) => {
                setSelectedWorkspace(w);
                setActiveView('workspace');
              }}
            />
          )}
          {activeView === 'workspace' && selectedWorkspace && (
            <WorkspaceDetail workspace={selectedWorkspace} companies={companies} onBack={() => setActiveView('workspaces')} />
          )}
          {activeView === 'radar' && (
            <SignalRadar
              events={events}
              companies={companies}
              onViewCompany={(c) => {
                setSelectedCompany(c);
                setActiveView('company');
              }}
            />
          )}
          {activeView === 'modeling' && <ModelingTools />}
          {activeView === 'watchlist' && (
            <WatchlistView
              watchlist={watchlist}
              companies={companies}
              onViewCompany={(c) => {
                setSelectedCompany(c);
                setActiveView('company');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {badge ? <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
  );
}

function Dashboard({ topTargets, topBuyers, recentEvents, onViewCompany }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Deal Intelligence Dashboard</h2>
        <p className="text-gray-600 mt-1">Real-time insights and predictions across your coverage universe</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard icon={Target} label="Active Opportunities" value="24" change="+3" color="blue" />
        <KPICard icon={TrendingUp} label="High Probability Targets" value="12" change="+2" color="green" />
        <KPICard icon={AlertCircle} label="Critical Signals" value="8" change="+5" color="red" />
        <KPICard icon={Briefcase} label="Deal Workspaces" value="6" change="+1" color="purple" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Predicted Targets</h3>
            <span className="text-sm text-gray-500">Next 12 months</span>
          </div>
          <div className="space-y-3">
            {topTargets.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => onViewCompany(company)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{company.name}</div>
                  <div className="text-sm text-gray-500">
                    {company.ticker} • {company.sector}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">${company.marketCap}B Market Cap</div>
                    <div className="text-xs text-gray-500">{company.ebitdaMargin}% EBITDA Margin</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-green-600">{company.dealProbTarget}%</div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Signals</h3>
          <div className="space-y-3">
            {recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <div className="text-sm font-medium text-gray-900">{event.type}</div>
                <div className="text-xs text-gray-600 mt-1">{event.company}</div>
                <div className="text-xs text-gray-500 mt-1">{event.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Likely Acquirers</h3>
        <div className="grid grid-cols-5 gap-4">
          {topBuyers.map((company) => (
            <div
              key={company.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => onViewCompany(company)}
            >
              <div className="font-medium text-gray-900 mb-1">{company.name}</div>
              <div className="text-xs text-gray-500 mb-3">{company.ticker}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Buyer Prob</span>
                <span className="text-lg font-bold text-blue-600">{company.dealProbBuyer}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, change, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function CompaniesView({ companies, sectorFilter, setSectorFilter, onViewCompany }) {
  const sectors = ['All', ...new Set(companies.map((c) => c.sector))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Company Universe</h2>
        <div className="flex items-center space-x-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Market Cap</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">EBITDA Margin</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leverage</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target Prob</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Buyer Prob</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewCompany(company)}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.ticker}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{company.sector}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">${company.marketCap}B</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">${company.revenue}M</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company.ebitdaMargin}%</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{company.leverage}x</td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      company.dealProbTarget > 70
                        ? 'bg-red-100 text-red-700'
                        : company.dealProbTarget > 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {company.dealProbTarget}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      company.dealProbBuyer > 60
                        ? 'bg-blue-100 text-blue-700'
                        : company.dealProbBuyer > 40
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {company.dealProbBuyer}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompanyProfile({ company, companies, onBack, onCreateWorkspace, watchlist, setWatchlist }) {
  const potentialBuyers = companies
    .filter((c) => c.id !== company.id && c.dealProbBuyer > 40)
    .map((c) => ({
      ...c,
      fitScore: Math.floor(Math.random() * 30) + 60,
      synergies: Math.floor(Math.random() * 50) + 20,
    }))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5);

  const isWatchlisted = watchlist.includes(company.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700">
          <ChevronRight className="w-5 h-5 transform rotate-180" />
          <span>Back to Companies</span>
        </button>
        <button
          onClick={() => setWatchlist(isWatchlisted ? watchlist.filter((id) => id !== company.id) : [...watchlist, company.id])}
          className={`px-4 py-2 rounded-lg font-medium ${isWatchlisted ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>{company.ticker}</span>
              <span>•</span>
              <span>{company.sector}</span>
              <span>•</span>
              <span>{company.region}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">${company.lastPrice}</div>
            <div className={`text-sm font-medium ${company.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {company.change > 0 ? <ArrowUpRight className="w-4 h-4 inline" /> : <ArrowDownRight className="w-4 h-4 inline" />}
              {Math.abs(company.change)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <MetricCard label="Market Cap" value={`$${company.marketCap}B`} />
          <MetricCard label="Revenue (LTM)" value={`$${company.revenue}M`} />
          <MetricCard label="EBITDA" value={`$${company.ebitda}M`} />
          <MetricCard label="Net Leverage" value={`${company.leverage}x`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Probability as Target</h3>
            <Target className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-5xl font-bold text-red-600 mb-2">{company.dealProbTarget}%</div>
          <div className="text-sm text-gray-600">Next 12 months</div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700 mb-2">Key Drivers:</div>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• High leverage ratio</li>
              <li>• Recent management changes</li>
              <li>• Activist investor presence</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Probability as Buyer</h3>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-5xl font-bold text-blue-600 mb-2">{company.dealProbBuyer}%</div>
          <div className="text-sm text-gray-600">Next 12 months</div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700 mb-2">Key Drivers:</div>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Strong cash position</li>
              <li>• Historical M&A activity</li>
              <li>• Market consolidation trend</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Fit Analysis - Top Potential Buyers</h3>
        <div className="space-y-3">
          {potentialBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{buyer.name}</div>
                <div className="text-sm text-gray-500">
                  {buyer.sector} • ${buyer.marketCap}B Market Cap
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Fit Score</div>
                  <div className="text-2xl font-bold text-green-600">{buyer.fitScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Synergies</div>
                  <div className="text-lg font-medium text-blue-600">${buyer.synergies}M</div>
                </div>
                <button
                  onClick={() => onCreateWorkspace(buyer, company)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events & Signals</h3>
        <div className="space-y-3">
          {company.recentEvents.map((event, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{event}</div>
                <div className="text-sm text-gray-600 mt-1">Detected {idx === 0 ? '2 days ago' : idx === 1 ? '1 week ago' : '2 weeks ago'}</div>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">High Impact</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function WorkspacesView({ workspaces, onViewWorkspace }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Workspaces</h2>
          <p className="text-gray-600 mt-1">Active deal analysis and scenario modeling</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">+ New Workspace</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => onViewWorkspace(workspace)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {workspace.buyer} → {workspace.target}
                </div>
                <div className="text-sm text-gray-500">Created {workspace.createdDate}</div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">{workspace.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-600 mb-1">Strategic Fit</div>
                <div className="text-2xl font-bold text-green-600">{workspace.fitScore}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Est. Synergies</div>
                <div className="text-2xl font-bold text-blue-600">${workspace.synergies}M</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceDetail({ workspace, companies, onBack }) {
  const buyer = companies.find((c) => c.name === workspace.buyer) || companies.find((c) => c.id === workspace.buyer.id);
  const target = companies.find((c) => c.name === workspace.target) || companies.find((c) => c.id === workspace.target.id);
  const [offerPrice, setOfferPrice] = useState(target ? target.lastPrice * 1.3 : 0);
  const [cashPortion, setCashPortion] = useState(70);

  if (!buyer || !target) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700">
          <ChevronRight className="w-5 h-5 transform rotate-180" />
          <span>Back to Workspaces</span>
        </button>
        <div className="p-6 bg-white border border-gray-200 rounded-lg">Buyer or target details not available.</div>
      </div>
    );
  }

  const premium = (((offerPrice - target.lastPrice) / target.lastPrice) * 100).toFixed(1);
  const dealValue = ((offerPrice * target.marketCap) / target.lastPrice).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700">
          <ChevronRight className="w-5 h-5 transform rotate-180" />
          <span>Back to Workspaces</span>
        </button>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Export to Excel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Generate Memo</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Deal Analysis: {workspace.buyer.name || workspace.buyer} acquires {workspace.target.name || workspace.target}
        </h1>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="Strategic Fit Score" value={workspace.fitScore.toString()} />
          <MetricCard label="Est. Revenue Synergies" value={`$${Math.floor(workspace.synergies * 0.6)}M`} />
          <MetricCard label="Est. Cost Synergies" value={`$${Math.floor(workspace.synergies * 0.4)}M`} />
          <MetricCard label="Synergy Multiple" value="8.5x" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Scenario Simulator</h3>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Price per Share ($)</label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.50"
            />
            <div className="text-sm text-gray-500 mt-1">Current price: ${target.lastPrice} | Premium: {premium}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cash Portion (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={cashPortion}
              onChange={(e) => setCashPortion(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">Cash: {cashPortion}% | Stock: {100 - cashPortion}%</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600 mb-1">Transaction Value</div>
            <div className="text-2xl font-bold text-gray-900">${dealValue}B</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Pro Forma Leverage</div>
            <div className="text-2xl font-bold text-gray-900">{(buyer.leverage * 1.4).toFixed(1)}x</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">2Y EPS Accretion</div>
            <div className="text-2xl font-bold text-green-600">+5.2%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Target Enterprise Value</span>
              <span className="font-medium">${dealValue}B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Premium to Last Price</span>
              <span className="font-medium text-green-600">{premium}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">EV / Revenue (LTM)</span>
              <span className="font-medium">{(parseFloat(dealValue) / (target.revenue / 1000)).toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">EV / EBITDA (LTM)</span>
              <span className="font-medium">{(parseFloat(dealValue) / (target.ebitda / 1000)).toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Rationale</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Complementary product portfolios with minimal overlap</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Geographic expansion into key European markets</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Significant cost synergies from consolidating operations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Enhanced scale to compete with larger industry players</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SignalRadar({ events, companies, onViewCompany }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Signal Radar</h2>
        <p className="text-gray-600 mt-1">Real-time monitoring of deal-relevant events and triggers</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {events.map((event, idx) => (
          <div key={event.id} className={`p-6 ${idx !== 0 ? 'border-t border-gray-200' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      event.impact === 'High'
                        ? 'bg-red-100 text-red-700'
                        : event.impact === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {event.impact} Impact
                  </span>
                  <span className="text-sm text-gray-500">{event.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.type}</h3>
                <div
                  className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium mb-2"
                  onClick={() => {
                    const company = companies.find((c) => c.name === event.company);
                    if (company) onViewCompany(company);
                  }}
                >
                  {event.company}
                </div>
                <p className="text-gray-700">{event.description}</p>
              </div>
              <AlertCircle
                className={`w-6 h-6 ml-4 ${
                  event.impact === 'High'
                    ? 'text-red-500'
                    : event.impact === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-blue-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelingTools() {
  const [modelType, setModelType] = useState('dcf');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Modeling Tools</h2>
        <p className="text-gray-600 mt-1">Automated valuation and transaction modeling</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setModelType('dcf')}
            className={`px-4 py-2 rounded-lg font-medium ${modelType === 'dcf' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            DCF Model
          </button>
          <button
            onClick={() => setModelType('lbo')}
            className={`px-4 py-2 rounded-lg font-medium ${modelType === 'lbo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            LBO Model
          </button>
          <button
            onClick={() => setModelType('merger')}
            className={`px-4 py-2 rounded-lg font-medium ${modelType === 'merger' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Merger Model
          </button>
        </div>

        {modelType === 'dcf' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">DCF Valuation Model</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Growth Rate (%)</label>
                <input type="number" defaultValue="8.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terminal Growth Rate (%)</label>
                <input type="number" defaultValue="2.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WACC (%)</label>
                <input type="number" defaultValue="9.2" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period (years)</label>
                <input type="number" defaultValue="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Generate Model</button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Export to Excel</button>
            </div>
          </div>
        )}

        {modelType === 'lbo' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">LBO Transaction Model</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price Multiple (EV/EBITDA)</label>
                <input type="number" defaultValue="10.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit Multiple (EV/EBITDA)</label>
                <input type="number" defaultValue="11.0" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debt / EBITDA</label>
                <input type="number" defaultValue="5.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor Equity (%)</label>
                <input type="number" defaultValue="35" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry Leverage (x)</label>
                <input type="number" defaultValue="6.0" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit Year</label>
                <input type="number" defaultValue="2029" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Run Model</button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Export to Excel</button>
            </div>
          </div>
        )}

        {modelType === 'merger' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Merger Model</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buyer</label>
                <input type="text" defaultValue="CloudScale Inc" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                <input type="text" defaultValue="SecureNet GmbH" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Synergies ($M)</label>
                <input type="number" defaultValue="40" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Synergies ($M)</label>
                <input type="number" defaultValue="55" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consideration Mix (Cash %)</label>
                <input type="number" defaultValue="65" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close</label>
                <input type="text" defaultValue="Q3 2025" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Evaluate Deal</button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Export to Excel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WatchlistView({ watchlist, companies, onViewCompany }) {
  const watchlistCompanies = companies.filter((company) => watchlist.includes(company.id));

  if (!watchlistCompanies.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Watchlist</h3>
        <p className="text-gray-600">No companies watchlisted yet. Mark companies to monitor them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Watchlist</h3>
        <div className="text-sm text-gray-600">{watchlistCompanies.length} companies</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {watchlistCompanies.map((company) => (
          <div
            key={company.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => onViewCompany(company)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{company.name}</div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-sm text-gray-600">{company.ticker} • {company.sector}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Target Prob</div>
                <div className="font-semibold text-red-600">{company.dealProbTarget}%</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Buyer Prob</div>
                <div className="font-semibold text-blue-600">{company.dealProbBuyer}%</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Leverage</div>
                <div className="font-semibold text-gray-800">{company.leverage}x</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
