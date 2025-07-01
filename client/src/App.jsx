// client/src/App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Home2 from './components/Home2.jsx'; // Make sure this import is correct
import Login from './components/Login.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';
import TicketsPage from './pages/TicketsPage';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';
import AdminDashboard from './admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App({ token, setToken }) {
  const location = useLocation();

  // Check if it's an auth route
  const isAuthPage = [
    '/login',
    '/reset-password',
    '/email-verify',
    '/register'
  ].includes(location.pathname);

  // Determine if the current path is the dashboard
  const isDashboard = location.pathname === '/';

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
        {!isAuthPage && <Sidebar />}
        <div className="flex-grow-1" style={{ flex: 1, padding: '32px 0' }}>
          <ToastContainer />
          <Routes>
            {/* Dashboard page - Use a key prop to force re-mount on navigation to "/" */}
            <Route path="/" element={<Home2 key={isDashboard ? location.key : "home2-static"} />} />
            {/* The key can be location.key or just location.pathname if you prefer */}
            {/* <Route path="/" element={<Home2 key={location.pathname} />} /> */}

            <Route path="/home" element={<Home />} />

            <Route path="/login" element={<Login onSuccess={setToken} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />

            <Route path="/tickets-page" element={<TicketsPage token={token} />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<Ticket />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tickets/open" element={<TicketsPage token={token} filter="open" />} />
            <Route path="/tickets/resolved" element={<TicketsPage token={token} filter="resolved" />} />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;