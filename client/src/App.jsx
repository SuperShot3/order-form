import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import OrderDetails from './pages/OrderDetails';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
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
