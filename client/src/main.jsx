import { createRoot } from 'react-dom/client';
import App from '../../src/App.tsx';
import { ErrorBoundary } from '../../src/components/ErrorBoundary.tsx';
import '../../src/index.css';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
