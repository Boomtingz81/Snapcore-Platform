// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ChargingAnalyticsApp from './ChargingAnalyticsApp';
import { registerSW, setupInstallPrompt } from './pwaUtils';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerSW();
  });
}

setupInstallPrompt(); // handles the beforeinstallprompt UX

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChargingAnalyticsApp />
  </React.StrictMode>
);
