import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [token, setToken] = useState('');
  const location = useLocation();

  // check if it's an auth route
  const isAuthPage = ['/login', '/reset-password', '/email-verify'].includes(location.pathname);

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <div style={{ display: 'flex' }}>
        {!isAuthPage && <Sidebar />}
        <div style={{ flex: 1 }}>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
