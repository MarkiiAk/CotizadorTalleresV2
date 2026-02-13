import { useEffect, useState } from 'react';
import { Wrench, Settings, CheckCircle } from 'lucide-react';

interface GarageLoaderProps {
  message?: string;
  onComplete?: () => void;
}

export const GarageLoader = ({ message = 'Guardando orden...', onComplete }: GarageLoaderProps) => {
  const [stage, setStage] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    // Simular el proceso de guardado
    const timer = setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        onComplete?.();
      }, 800);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (stage === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-sag-100 dark:bg-sag-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-sag-600 dark:text-sag-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Orden Guardada!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              La orden se ha guardado exitosamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          {/* Animación de herramientas */}
          <div className="relative h-32 mb-6">
            {/* Llave inglesa principal */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Wrench 
                className="w-16 h-16 text-sag-600 dark:text-sag-400 animate-spin-slow" 
                style={{ 
                  animationDuration: '3s',
                  transformOrigin: 'center'
                }}
              />
            </div>
            
            {/* Engranaje 1 */}
            <div className="absolute left-1/4 top-1/4">
              <Settings 
                className="w-10 h-10 text-sag-600 dark:text-sag-500 animate-spin-reverse" 
                style={{ animationDuration: '2s' }}
              />
            </div>
            
            {/* Engranaje 2 */}
            <div className="absolute right-1/4 top-1/3">
              <Settings 
                className="w-8 h-8 text-sag-700 dark:text-sag-600 animate-spin" 
                style={{ animationDuration: '1.5s' }}
              />
            </div>
            
            {/* Engranaje 3 */}
            <div className="absolute left-1/3 bottom-1/4">
              <Settings 
                className="w-6 h-6 text-sag-500 dark:text-sag-400 animate-spin-reverse" 
                style={{ animationDuration: '2.5s' }}
              />
            </div>
          </div>

          {/* Mensaje */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {message}
          </h3>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sag-600 to-sag-500 rounded-full animate-progress"></div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Procesando información...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .animate-progress {
          animation: progress 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
