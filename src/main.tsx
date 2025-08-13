import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/debug'

// Force dark mode
try {
  document.documentElement.classList.add('dark');
} catch (error) {
  console.error('Error setting dark mode:', error);
}

// Add error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element not found');
}

try {
  createRoot(root).render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback UI
  root.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #000; color: #fff;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Loading Error</h1>
        <p style="margin-bottom: 2rem;">There was an error loading the application.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
