import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import OrderDetails from './pages/OrderDetails';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { getSettings } from './api/settings';
import { BACKEND_UNAVAILABLE } from './api/client';

function App() {
  const [noBackend, setNoBackend] = useState(false);

  useEffect(() => {
    getSettings().catch((e) => {
      if (e.message === BACKEND_UNAVAILABLE) setNoBackend(true);
    });
  }, []);

  return (
    <BrowserRouter>
      {noBackend && (
        <div className="banner backend-offline">
          {BACKEND_UNAVAILABLE}
        </div>
      )}
      <nav className="nav">
        <NavLink to="/" end>Orders</NavLink>
        <NavLink to="/new">New Order</NavLink>
        <NavLink to="/messages">Messages</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/settings">Settings</NavLink>
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
    </BrowserRouter>
  );
}

export default App;
