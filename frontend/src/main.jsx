import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <FeatureFlagProvider>
          <AuthProvider>
            <SocketProvider>
              <App />
              <Toaster position="top-right" />
            </SocketProvider>
          </AuthProvider>
        </FeatureFlagProvider>
      </HeroUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);
