// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// --- Global CSS Imports ---
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/themes.css'; // Your custom CSS variables for light/dark mode
import './index.css';          // Your main global CSS, including Tailwind directives and base styles

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        {/* --- WRAP APP WITH NotificationProvider --- */}
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);