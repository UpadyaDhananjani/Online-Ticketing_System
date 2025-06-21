import React, { useState } from 'react';
import TicketsPage from './pages/TicketsPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Sidebar from './components/Sidebar';
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
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <TicketsPage token={token} />
      </div>
    </div>
  );
}

export default App;
