// /src/main.jsx
import './index.css'; // ✅ Tailwind / global styles first
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// 🔍 Global error logging (keeps app visible if something crashes)
window.onerror = (message, source, lineno, colno, error) => {
  console.error('GlobalError:', { message, source, lineno, colno, error });
};
window.onunhandledrejection = (event) => {
  console.error('UnhandledPromiseRejection:', event.reason);
};

// ✅ Mount app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🚨 Smoke banner - always shows if React mounted */}
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        background: '#ef4444',
        color: '#fff',
        padding: '4px 8px',
        fontSize: '12px',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: 4,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      React mounted 🚀
    </div>

    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
