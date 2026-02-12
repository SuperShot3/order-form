import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import OrderDetails from './pages/OrderDetails';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { getSettings } from './api/settings';
import { getOrdersSummary } from './api/orders';
import { BACKEND_UNAVAILABLE, setAuthHeaderGetter, setOnUnauthorized } from './api/client';
import { getAuthStatus, getAuthHeader, getStoredToken, logout } from './api/auth';

function formatMoney(n) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function App() {
  const [noBackend, setNoBackend] = useState(false);
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'login' | 'authenticated'
  const [protectedSite, setProtectedSite] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    setAuthHeaderGetter(getAuthHeader);
    setOnUnauthorized(() => {
      logout();
      setAuthState('login');
    });
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (authState === 'authenticated') {
      getOrdersSummary()
        .then(setSummary)
        .catch(() => setSummary(null));
    }
  }, [authState, location.pathname]);

  useEffect(() => {
    getAuthStatus()
      .then(({ protected: p }) => {
        setProtectedSite(!!p);
        if (!p) {
          setAuthState('authenticated');
          return;
        }
        if (getStoredToken()) {
          setAuthState('authenticated');
          getSettings().catch((e) => {
            if (e.message === BACKEND_UNAVAILABLE) setNoBackend(true);
            else if (e.message === 'Authentication required') setAuthState('login');
          });
        } else {
          setAuthState('login');
        }
      })
      .catch(() => setAuthState('login'));
  }, []);

  const handleLoginSuccess = () => setAuthState('authenticated');

  if (authState === 'checking') {
    return <div className="login-page"><div className="login-box"><p>Loading...</p></div></div>;
  }

  if (authState === 'login' && protectedSite) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {noBackend && (
        <div className="banner backend-offline">
          {BACKEND_UNAVAILABLE}
        </div>
      )}
      <nav className="nav">
        <img src="/logo.png" alt="Logo" className="nav-logo" />
        <NavLink to="/" end>Orders</NavLink>
        <NavLink to="/new">New Order</NavLink>
        <NavLink to="/messages">Messages</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        {summary && (
          <div className="nav-summary">
            <span title="Gross revenue (Total Amount Received)">Gross: {formatMoney(summary.gross)} THB</span>
            <span title="Total profit">Profit: {formatMoney(summary.totalProfit)} THB</span>
            <span title="Total delivery fees">Delivery: {formatMoney(summary.totalDelivery)} THB</span>
          </div>
        )}
        {protectedSite && (
          <button
            type="button"
            onClick={() => { logout(); setAuthState('login'); }}
            className="nav-logout"
          >
            Log out
          </button>
        )}
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<OrdersList />} />
          <Route path="/new" element={<NewOrder />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
