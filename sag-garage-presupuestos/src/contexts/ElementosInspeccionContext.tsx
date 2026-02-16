import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ElementoInspeccion } from '../types';
import { elementosInspeccionAPI } from '../services/api';

interface ElementosInspeccionContextType {
  elementos: ElementoInspeccion[];
  isLoading: boolean;
  error: string | null;
  loadElementos: () => Promise<void>;
}

const ElementosInspeccionContext = createContext<ElementosInspeccionContextType | undefined>(undefined);

export const useElementosInspeccion = () => {
  const context = useContext(ElementosInspeccionContext);
  if (context === undefined) {
    throw new Error('useElementosInspeccion must be used within an ElementosInspeccionProvider');
  }
  return context;
};

interface ElementosInspeccionProviderProps {
  children: ReactNode;
}

export const ElementosInspeccionProvider: React.FC<ElementosInspeccionProviderProps> = ({ children }) => {
  const [elementos, setElementos] = useState<ElementoInspeccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadElementos = async () => {
    // Si ya están cargados, no volver a cargar
    if (loaded) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Cargando elementos de inspección desde contexto...');
      const response = await elementosInspeccionAPI.getElementos();
      
      if (Array.isArray(response)) {
        setElementos(response);
        setLoaded(true);
        console.log('✅ Elementos cargados en contexto:', response.length, 'elementos');
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('❌ Error cargando elementos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setElementos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    elementos,
    isLoading,
    error,
    loadElementos,
  };

  return (
    <ElementosInspeccionContext.Provider value={value}>
      {children}
    </ElementosInspeccionContext.Provider>
  );
};