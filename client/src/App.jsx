import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TicketsPage from './pages/TicketsPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import { Navigate } from 'react-router-dom';
import Ticket from './pages/Ticket';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  // const [showRegister, setShowRegister] = useState(false);

  // const handleLoginSuccess = (token) => {
  //   setToken(token);
  //   setShowRegister(false);
  // };

  // const handleLogout = () => {
  //   setToken('');
  // };

  // if (!token) {
  //   return (
  //     <div style={{ maxWidth: 400, margin: '50px auto' }}>
  //       {showRegister ? (
  //         <>
  //           <RegisterForm onSuccess={() => setShowRegister(false)} />
  //           <p>
  //             Already have an account?{' '}
  //             <button onClick={() => setShowRegister(false)}>Login</button>
  //           </p>
  //         </>
  //       ) : (
  //         <>
  //           <LoginForm onSuccess={handleLoginSuccess} />
  //           <p>
  //             Don't have an account?{' '}
  //             <button onClick={() => setShowRegister(true)}>Register</button>
  //           </p>
  //         </>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
        <Sidebar />
        <div className="flex-grow-1" style={{ padding: '32px 0' }}>
          <Routes>
            <Route path ="/" element={<Navigate to="/tickets" />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/login" element={<LoginForm onSuccess={setToken} />} />
            <Route path="/register" element={<RegisterForm onSuccess={setToken} />} />
            <Route path="/tickets/:id" element={<Ticket />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add other routes here */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
