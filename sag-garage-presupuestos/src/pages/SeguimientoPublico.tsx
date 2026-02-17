import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui';

interface SeguimientoData {
  orden: {
    numero: string;
    cliente: string;
    vehiculo: string;
    problema: string;
    fechaIngreso: string;
    fechaPromesa: string | null;
  };
  estado: {
    actual: string;
    descripcion: string;
    color: string;
  };
  resumen: {
    total: number;
    anticipo: number;
    saldoPendiente: number;
  };
  timeline: Array<{
    fecha: string;
    estado: string;
    descripcion: string;
    mensaje: string;
    color: string;
  }>;
}

const SeguimientoPublico: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SeguimientoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de seguimiento no válido');
      setLoading(false);
      return;
    }

    fetchSeguimientoData();
  }, [token]);

  const fetchSeguimientoData = async () => {
    try {
      const response = await fetch(`/n3wv3r510nh1dd3n/backend-php/seguimiento/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Token de seguimiento no encontrado o expirado');
        }
        throw new Error('Error al obtener información de seguimiento');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No definida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getEstadoColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'green': 'bg-green-100 text-green-800 border-green-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'gray': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Obteniendo información de su vehículo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error de acceso</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center p-6">
            <p>No se encontró información de seguimiento</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src="/logo.png" alt="SAG Garage" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Servicio</h1>
          <p className="mt-2 text-sm text-gray-600">
            Información actualizada en tiempo real sobre el estado de su vehículo
          </p>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Orden</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Número de Orden:</span>
                  <p className="text-lg font-semibold text-gray-900">{data.orden.numero}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Cliente:</span>
                  <p className="text-gray-900">{data.orden.cliente}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Vehículo:</span>
                  <p className="text-gray-900">{data.orden.vehiculo}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha de Ingreso:</span>
                  <p className="text-gray-900">{formatDate(data.orden.fechaIngreso)}</p>
                </div>
                {data.orden.fechaPromesa && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha Promesa:</span>
                    <p className="text-gray-900">{formatDate(data.orden.fechaPromesa)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado Actual</h3>
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getEstadoColor(data.estado.color)}`}>
                  {data.estado.actual}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{data.estado.descripcion}</p>
              
              {data.resumen.total > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total del Servicio:</span>
                    <span className="text-sm font-medium">{formatCurrency(data.resumen.total)}</span>
                  </div>
                  {data.resumen.anticipo > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Anticipo Pagado:</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(data.resumen.anticipo)}</span>
                    </div>
                  )}
                  {data.resumen.saldoPendiente > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Saldo Pendiente:</span>
                      <span className="text-sm font-medium text-orange-600">{formatCurrency(data.resumen.saldoPendiente)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Problema Reportado */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Problema Reportado</h3>
            <p className="text-gray-700">{data.orden.problema}</p>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Historial del Servicio</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {data.timeline.map((evento, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== data.timeline.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            evento.color === 'green' ? 'bg-green-500' :
                            evento.color === 'blue' ? 'bg-blue-500' :
                            evento.color === 'yellow' ? 'bg-yellow-500' :
                            evento.color === 'orange' ? 'bg-orange-500' :
                            evento.color === 'red' ? 'bg-red-500' :
                            evento.color === 'purple' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}>
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{evento.estado}</p>
                            <p className="text-sm text-gray-500">{evento.mensaje}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(evento.fecha)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Tiene alguna duda? Contáctenos al teléfono del taller o visite nuestras instalaciones
          </p>
          <div className="mt-2">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Visitar sitio web de SAG Garage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPublico;