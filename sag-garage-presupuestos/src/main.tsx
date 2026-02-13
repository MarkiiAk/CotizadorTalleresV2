import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Componente wrapper para remover el loader inicial
function AppWrapper() {
  useEffect(() => {
    // Garantizar que el loader se vea por al menos 800ms antes de quitarlo
    const minimumLoadTime = 800;
    const startTime = Date.now();
    
    const removeLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        // Agregar fade out suave
        loader.style.transition = 'opacity 0.4s ease-out';
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
        }, 400);
      }
    };

    // Calcular cuánto tiempo ha pasado y esperar el mínimo
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
    
    setTimeout(removeLoader, remainingTime);
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
