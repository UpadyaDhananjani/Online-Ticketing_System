import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Home2 from './components/Home2.jsx';
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

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
        {!isAuthPage && <Sidebar />}
        <div className="flex-grow-1" style={{ flex: 1, padding: '32px 0' }}>
          <ToastContainer />
          <Routes>
            {/* Home and Auth */}
            <Route path="/" element={<Navigate to="/tickets" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/home2" element={<Home2 />} />

            <Route path="/login" element={<Login onSuccess={setToken} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />

            {/* Ticketing System */}
            <Route path="/tickets-page" element={<TicketsPage token={token} />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<Ticket />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tickets/open" element={<TicketsPage token={token} filter="open" />} />
            <Route path="/tickets/resolved" element={<TicketsPage token={token} filter="resolved" />} />

            {/* Add any additional routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
