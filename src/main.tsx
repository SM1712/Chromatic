import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

// Global Unhandled Error Capturer
window.onerror = function (msg, url, lineNo, columnNo, error) {
  const errorText = `[Global Error] ${msg}\nEn: ${url}:${lineNo}:${columnNo}\nDetalles: ${error?.stack || error}`;
  console.error(errorText);
  alert(`⚠️ Error al iniciar Chromatic:\n${msg}\nFila: ${lineNo}:${columnNo}\nURL: ${url}`);
};

window.addEventListener('unhandledrejection', function (event) {
  const reason = event.reason;
  const errorText = `[Unhandled Rejection] ${reason?.stack || reason}`;
  console.error(errorText);
  alert(`⚠️ Error Asíncrono al iniciar:\n${reason?.message || reason}`);
});

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          background: '#1e1b4b',
          color: '#ffffff',
          minHeight: '100vh',
          fontFamily: 'monospace',
          overflow: 'auto'
        }}>
          <h1 style={{ color: '#f87171', fontSize: '22px', marginBottom: '16px' }}>
            ⚠️ Error Crítico durante la ejecución de Chromatic
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
            Se ha producido un fallo al renderizar la interfaz:
          </p>
          <div style={{
            background: '#0f172a',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {this.state.error?.toString()}
            {'\n\n'}
            <strong>Stack Trace:</strong>
            {'\n'}
            {this.state.error?.stack}
            {'\n\n'}
            <strong>Component Stack:</strong>
            {'\n'}
            {this.state.errorInfo?.componentStack}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Recargar Aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Error al registrar Service Worker:', err);
    });
  });
}

console.log('🚀 [Diagnostic] Iniciando Chromatic main.tsx...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  alert('❌ Error fatal: No se encontró el elemento #root en el HTML');
} else {
  console.log('✅ [Diagnostic] Elemento #root encontrado, renderizando React...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
}
