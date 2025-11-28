import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeatureFlagProvider>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </FeatureFlagProvider>
    </BrowserRouter>
  </React.StrictMode>
);
