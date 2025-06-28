window.global = window;
// @ts-ignore
window.process = {
  env: { DEBUG: undefined },
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};

window.addEventListener('load', () => {
  registerServiceWorker();
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
