import { useState, useEffect } from 'react';
import { Card } from '../ui';
import { estadosSeguridadAPI, puntosSeguridadAPI } from '../../services/api';
import type { EstadoSeguridad, PuntoSeguridadCatalogo, PuntoSeguridadOrden } from '../../types';

interface PuntosSeguridadSectionProps {
  puntosSeguridad: PuntoSeguridadOrden[];
  onChange: (puntos: PuntoSeguridadOrden[]) => void;
  disabled?: boolean;
}

export function PuntosSeguridadSection({ 
  puntosSeguridad, 
  onChange, 
  disabled = false 
}: PuntosSeguridadSectionProps) {
  const [estados, setEstados] = useState<EstadoSeguridad[]>([]);
  const [catalogo, setCatalogo] = useState<PuntoSeguridadCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [estadosData, catalogoData] = await Promise.all([
        estadosSeguridadAPI.getAll(),
        puntosSeguridadAPI.getCatalogo()
      ]);
      
      setEstados(estadosData.filter(e => e.activo).sort((a, b) => a.orden - b.orden));
      setCatalogo(catalogoData.filter(c => c.activo).sort((a, b) => a.orden - b.orden));
      
      if (puntosSeguridad.length === 0) {
        const puntosIniciales: PuntoSeguridadOrden[] = catalogoData
          .filter(c => c.activo)
          .map(punto => ({
            id: 0,
            ordenId: 0,
            puntoId: punto.id,
            estadoId: estadosData.find(e => e.nombre === 'Bueno')?.id || 1,
            observaciones: '',
            fechaRevision: new Date().toISOString(),
            punto
          }));
        onChange(puntosIniciales);
      }
    } catch (err) {
      console.error('Error cargando datos de seguridad:', err);
      setError('Error al cargar los datos de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (puntoId: number, nuevoEstadoId: number) => {
    const puntosActualizados = puntosSeguridad.map(p => 
      p.puntoId === puntoId ? { ...p, estadoId: nuevoEstadoId } : p
    );
    onChange(puntosActualizados);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500 dark:text-gray-400">Cargando puntos de seguridad...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      {/* Header con estilo consistente */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-3">
        🔍 Inspección de Seguridad
      </h2>

      {/* Grid compacto: 2-3 puntos por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {catalogo.map(punto => {
          const puntoEstado = puntosSeguridad.find(p => p.puntoId === punto.id);
          
          return (
            <div 
              key={punto.id} 
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {/* Nombre del punto */}
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2 truncate" title={punto.nombre}>
                {punto.nombre}
              </div>

              {/* Botones de estado en fila */}
              <div className="flex gap-1">
                {estados.map(estado => {
                  const isSelected = puntoEstado?.estadoId === estado.id;
                  return (
                    <button
                      key={estado.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleEstadoChange(punto.id, estado.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md
                        text-xs font-medium transition-all duration-150
                        ${isSelected 
                          ? 'shadow-md scale-[1.02]' 
                          : 'opacity-60 hover:opacity-100'
                        }
                        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer active:scale-95'}
                      `}
                      style={{
                        backgroundColor: isSelected ? estado.color : 'transparent',
                        borderColor: estado.color,
                        border: `1px solid ${estado.color}`,
                        color: isSelected ? '#fff' : estado.color,
                        boxShadow: isSelected ? `0 2px 8px ${estado.color}40` : 'none'
                      }}
                      title={estado.nombre}
                    >
                      <span className="text-sm">{estado.icono}</span>
                      <span className="hidden sm:inline">{estado.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen compacto */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 mt-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resumen:</span>
          <div className="flex gap-4">
            {estados.map(estado => {
              const count = puntosSeguridad.filter(p => p.estadoId === estado.id).length;
              return (
                <div key={estado.id} className="flex items-center gap-1.5 text-sm">
                  <span>{estado.icono}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                  <span className="text-gray-500 dark:text-gray-500 hidden sm:inline">{estado.nombre}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}