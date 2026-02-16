import { useEffect, useState } from 'react';
import { Sun, Moon, FileText, Download, Save, ArrowLeft, PlayCircle, CheckCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useNavigate, useParams } from 'react-router-dom';
import { usePresupuestoStore } from '../store/usePresupuestoStore';
import { ordenesAPI, elementosInspeccionAPI } from '../services/api';
import { GarageLoader } from '../components/ui/GarageLoader';
import { mergePDFWithGarantia } from '../utils/pdfMerger';
import { useToastContext } from '../contexts/ToastContext';
import {
  ClienteSection,
  VehiculoSection,
  InspeccionSection,
  ProblemaSection,
  ServiciosSection,
  RefaccionesSection,
  ManoObraSection,
  ResumenSection,
  GarantiaSection,
  PuntosSeguridadSection,
} from '../components/sections';
import { Button } from '../components/ui';
import { PDFDocument } from '../components/PDFDocument';
import type { Orden } from '../types';

// Mapeo de estados
const ESTADOS = {
  1: { nombre: 'RECIBIDO', color: 'bg-blue-100 text-blue-800', darkColor: 'dark:bg-blue-900/20 dark:text-blue-300' },
  2: { nombre: 'EN DIAGNÓSTICO', color: 'bg-yellow-100 text-yellow-800', darkColor: 'dark:bg-yellow-900/20 dark:text-yellow-300' },
  3: { nombre: 'COTIZACIÓN LISTA', color: 'bg-purple-100 text-purple-800', darkColor: 'dark:bg-purple-900/20 dark:text-purple-300' },
  4: { nombre: 'APROBADO', color: 'bg-green-100 text-green-800', darkColor: 'dark:bg-green-900/20 dark:text-green-300' },
  5: { nombre: 'EN TRABAJO', color: 'bg-orange-100 text-orange-800', darkColor: 'dark:bg-orange-900/20 dark:text-orange-300' },
  6: { nombre: 'ESPERANDO REFACCIONES', color: 'bg-amber-100 text-amber-800', darkColor: 'dark:bg-amber-900/20 dark:text-amber-300' },
  7: { nombre: 'EN PRUEBAS', color: 'bg-indigo-100 text-indigo-800', darkColor: 'dark:bg-indigo-900/20 dark:text-indigo-300' },
  8: { nombre: 'LISTO PARA ENTREGA', color: 'bg-cyan-100 text-cyan-800', darkColor: 'dark:bg-cyan-900/20 dark:text-cyan-300' },
  9: { nombre: 'ENTREGADO', color: 'bg-gray-100 text-gray-800', darkColor: 'dark:bg-gray-900/20 dark:text-gray-300' },
  10: { nombre: 'CANCELADO', color: 'bg-red-100 text-red-800', darkColor: 'dark:bg-red-900/20 dark:text-red-300' },
};

export const DetalleOrden = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { presupuesto, themeMode, toggleTheme, loadFromOrden, markAsSaved } = usePresupuestoStore();
  const { showSuccess, showError } = useToastContext();
  const [showLoader, setShowLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orden, setOrden] = useState<Orden | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [elementosInspeccion, setElementosInspeccion] = useState<any[]>([]);

  const estadoActual = orden?.estado_id || 1;
  const estadoInfo = ESTADOS[estadoActual as keyof typeof ESTADOS] || ESTADOS[1];

  // Aplicar el tema al documento
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Cargar orden y elementos de inspección en paralelo
  useEffect(() => {
    const cargarDatosCompletos = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('📋 Cargando datos completos para orden:', id);
        
        // Ejecutar ambas llamadas API en paralelo
        const [ordenData, elementosData] = await Promise.all([
          ordenesAPI.getById(id),
          elementosInspeccionAPI.getElementos()
        ]);
        
        console.log('✅ Orden cargada:', ordenData);
        console.log('✅ Elementos inspección cargados:', elementosData?.length || 0, 'elementos');
        
        if (ordenData) {
          setOrden(ordenData);
          loadFromOrden(ordenData);
          
          // Guardar elementos de inspección en el estado
          if (elementosData && Array.isArray(elementosData)) {
            setElementosInspeccion(elementosData);
          }
          
          // Solo quitar loader después de que todo esté completamente cargado
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        } else {
          showError('Error', 'Orden no encontrada');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showError('Error', 'Error al cargar la información de la orden');
        navigate('/dashboard');
      }
    };

    cargarDatosCompletos();
  }, [id, navigate, loadFromOrden, showError]);

  const handleGeneratePDF = async () => {
    try {
      // Generar el PDF del presupuesto
      const presupuestoBlob = await pdf(<PDFDocument presupuesto={presupuesto} />).toBlob();
      
      // Fusionar con el PDF de garantía
      const mergedBlob = await mergePDFWithGarantia(presupuestoBlob);
      
      // Descargar el PDF fusionado
      const url = URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = url;
      const nombreCliente = presupuesto.cliente.nombreCompleto.replace(/\s+/g, '_').toUpperCase();
      const modelo = presupuesto.vehiculo.modelo.replace(/\s+/g, '_').toUpperCase();
      link.download = `SAG_Garage_${presupuesto.folio}_${modelo}_${nombreCliente}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess('PDF Generado', 'El archivo se ha descargado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showError('Error', 'No se pudo generar el PDF');
    }
  };

  const handleSaveChanges = async () => {
    if (!id) return;

    try {
      setShowLoader(true);

      // Actualizar la orden con los cambios
      const ordenActualizada = {
        taller: presupuesto.taller,
        cliente: presupuesto.cliente,
        vehiculo: {
          ...presupuesto.vehiculo,
          nivelCombustible: presupuesto.vehiculo.nivelGasolina,
        },
        inspeccion: presupuesto.inspeccion,
        problemaReportado: presupuesto.problemaReportado,
        diagnosticoTecnico: presupuesto.diagnosticoTecnico,
        servicios: presupuesto.servicios,
        refacciones: presupuesto.refacciones,
        manoDeObra: presupuesto.manoDeObra,
        resumen: presupuesto.resumen,
        puntosSeguridad: presupuesto.puntosSeguridad || [],
        fechaSalida: presupuesto.fechaSalida?.toISOString() || null,
        fechaEntrada: presupuesto.fechaEntrada?.toISOString() || presupuesto.fecha.toISOString(),
      };

      console.log('💾 Actualizando orden en API...');
      await ordenesAPI.update(id, ordenActualizada);
      console.log('✅ Orden actualizada exitosamente');
      markAsSaved();
      showSuccess('Cambios guardados', 'La orden ha sido actualizada');
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setShowLoader(false);
      showError('Error', 'No se pudieron guardar los cambios');
    }
  };

  const handleAdvanceState = async () => {
    if (!id || !orden) return;

    const nextStateId = estadoActual + 1;
    if (nextStateId > 10) return; // No avanzar más allá del último estado

    try {
      setShowLoader(true);
      console.log(`🔄 Avanzando estado de ${estadoActual} a ${nextStateId}`);
      
      await ordenesAPI.update(id, { estado_id: nextStateId });
      
      // Recargar la orden
      const ordenActualizada = await ordenesAPI.getById(id);
      if (ordenActualizada) {
        setOrden(ordenActualizada);
      }
      
      const nextStateInfo = ESTADOS[nextStateId as keyof typeof ESTADOS];
      showSuccess('Estado actualizado', `La orden ahora está en: ${nextStateInfo.nombre}`);
    } catch (error) {
      console.error('Error al avanzar estado:', error);
      setShowLoader(false);
      showError('Error', 'No se pudo avanzar el estado');
    }
  };

  const handleCloseOrden = async () => {
    if (!id) return;

    try {
      setShowLoader(true);
      console.log('🔒 Cerrando orden en API...');
      await ordenesAPI.update(id, { estado: 'cerrada', estado_id: 9 }); // ENTREGADO
      console.log('✅ Orden cerrada exitosamente');
      setShowCloseModal(false);
      
      const ordenActualizada = await ordenesAPI.getById(id);
      if (ordenActualizada) {
        setOrden(ordenActualizada);
      }
      showSuccess('Orden cerrada', 'La orden ha sido marcada como entregada');
    } catch (error) {
      console.error('Error al cerrar orden:', error);
      setShowLoader(false);
      setShowCloseModal(false);
      showError('Error', 'No se pudo cerrar la orden');
    }
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  // Determinar qué secciones mostrar según el estado
  const shouldShowSection = (section: string) => {
    switch (section) {
      case 'cliente':
      case 'vehiculo':
      case 'problema':
      case 'inspeccionVisual':
        return true; // Siempre visible
      case 'diagnostico':
      case 'puntosSeguridad':
        return estadoActual >= 2; // Desde EN DIAGNÓSTICO
      case 'servicios':
      case 'refacciones':
      case 'manoObra':
      case 'resumen':
        return estadoActual >= 3; // Desde COTIZACIÓN LISTA
      case 'garantia':
        return estadoActual >= 4; // Desde APROBADO
      default:
        return true;
    }
  };

  // Determinar si una sección debe estar en modo readonly
  const isSectionReadonly = (section: string) => {
    // Las órdenes entregadas o canceladas son completamente readonly
    if (estadoActual >= 9) return true;

    switch (section) {
      case 'cliente':
      case 'vehiculo':
      case 'problema':
      case 'inspeccionVisual':
        return estadoActual > 1; // Readonly después de RECIBIDO
      case 'diagnostico':
      case 'puntosSeguridad':
        return estadoActual > 2; // Readonly después de EN DIAGNÓSTICO
      case 'servicios':
      case 'refacciones':
      case 'manoObra':
        return estadoActual > 3; // Readonly después de COTIZACIÓN LISTA
      default:
        return false;
    }
  };

  // Mostrar loader mientras carga la orden
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sag-600 to-sag-700 rounded-2xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cargando orden...
          </h2>
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-sag-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-sag-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-sag-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-3 h-3 bg-sag-600 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const canAdvanceState = estadoActual < 9 && estadoActual !== 10; // No se puede avanzar desde ENTREGADO o CANCELADO
  const canEdit = estadoActual < 9 && estadoActual !== 10; // No se puede editar si está entregado o cancelado

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                icon={<ArrowLeft size={20} />}
                className="!p-3"
                title="Volver al Dashboard"
              />
              <div className="w-12 h-12 bg-gradient-to-br from-sag-500 to-sag-600 rounded-xl flex items-center justify-center shadow-lg shadow-sag-500/30">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {presupuesto.folio}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color} ${estadoInfo.darkColor}`}>
                    {estadoInfo.nombre}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3">
              {/* Toggle tema */}
              <Button
                variant="secondary"
                onClick={toggleTheme}
                icon={themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                className="!p-3"
                title={`Cambiar a modo ${themeMode === 'light' ? 'oscuro' : 'claro'}`}
              />

              {/* Avanzar Estado */}
              {canAdvanceState && (
                <Button
                  variant="primary"
                  onClick={handleAdvanceState}
                  icon={<PlayCircle size={20} />}
                  disabled={showLoader}
                  className="hidden md:flex"
                >
                  Avanzar Estado
                </Button>
              )}

              {/* Guardar Cambios */}
              {canEdit && (
                <Button
                  variant="success"
                  onClick={handleSaveChanges}
                  icon={<Save size={20} />}
                  disabled={showLoader}
                  className="hidden md:flex"
                >
                  Guardar Cambios
                </Button>
              )}

              {/* Marcar como Entregado */}
              {estadoActual === 8 && (
                <Button
                  variant="primary"
                  onClick={() => setShowCloseModal(true)}
                  icon={<CheckCircle size={20} />}
                  disabled={showLoader}
                  className="hidden md:flex"
                >
                  Marcar Entregado
                </Button>
              )}

              {/* Generar PDF */}
              <Button
                variant="secondary"
                onClick={handleGeneratePDF}
                icon={<Download size={20} />}
                className="hidden md:flex"
              >
                Generar PDF
              </Button>
            </div>
          </div>

          {/* Botones móviles */}
          <div className="flex md:hidden gap-2 mt-3">
            {canAdvanceState && (
              <Button
                variant="primary"
                onClick={handleAdvanceState}
                icon={<PlayCircle size={18} />}
                disabled={showLoader}
                className="flex-1 !text-sm"
              >
                Avanzar
              </Button>
            )}
            {canEdit && (
              <Button
                variant="success"
                onClick={handleSaveChanges}
                icon={<Save size={18} />}
                disabled={showLoader}
                className="flex-1 !text-sm"
              >
                Guardar
              </Button>
            )}
            {estadoActual === 8 && (
              <Button
                variant="primary"
                onClick={() => setShowCloseModal(true)}
                icon={<CheckCircle size={18} />}
                disabled={showLoader}
                className="flex-1 !text-sm"
              >
                Entregar
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleGeneratePDF}
              icon={<Download size={18} />}
              className="flex-1 !text-sm"
            >
              PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="w-4/5 mx-auto space-y-6">
          {/* Información del Cliente - Siempre visible */}
          <ClienteSection disabled={isSectionReadonly('cliente')} />

          {/* Información del Vehículo - Siempre visible */}
          <VehiculoSection disabled={isSectionReadonly('vehiculo')} />

          {/* Problema Reportado - Siempre visible */}
          <ProblemaSection disabled={isSectionReadonly('problema')} />

          {/* Inspección Visual del Vehículo - Siempre visible */}
            <InspeccionSection 
              disabled={true} 
            />

          {/* Puntos de Seguridad - Desde EN DIAGNÓSTICO */}
          {shouldShowSection('puntosSeguridad') && (
            <PuntosSeguridadSection 
              puntosSeguridad={presupuesto.puntosSeguridad || []}
              onChange={(puntos) => usePresupuestoStore.getState().updatePuntosSeguridad(puntos)}
              disabled={isSectionReadonly('puntosSeguridad')}
            />
          )}

          {/* Servicios - Desde COTIZACIÓN LISTA */}
          {shouldShowSection('servicios') && (
            <ServiciosSection disabled={isSectionReadonly('servicios')} />
          )}

          {/* Refacciones y Mano de Obra - Desde COTIZACIÓN LISTA */}
          {(shouldShowSection('refacciones') || shouldShowSection('manoObra')) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shouldShowSection('refacciones') && (
                <RefaccionesSection disabled={isSectionReadonly('refacciones')} />
              )}
              {shouldShowSection('manoObra') && (
                <ManoObraSection disabled={isSectionReadonly('manoObra')} />
              )}
            </div>
          )}

          {/* Resumen Financiero - Desde COTIZACIÓN LISTA */}
          {shouldShowSection('resumen') && (
            <ResumenSection />
          )}

          {/* Garantía - Desde APROBADO */}
          {shouldShowSection('garantia') && (
            <GarantiaSection />
          )}

          {/* Mensaje informativo según el estado */}
          <div className={`border rounded-lg p-4 ${estadoInfo.color} ${estadoInfo.darkColor}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  Estado actual: {estadoInfo.nombre}
                </h3>
                <div className="mt-2 text-sm">
                  {estadoActual === 1 && (
                    <p>Orden recibida. Haz clic en "Avanzar Estado" para comenzar el diagnóstico.</p>
                  )}
                  {estadoActual === 2 && (
                    <p>Completa el diagnóstico técnico y los puntos de seguridad, luego avanza para generar la cotización.</p>
                  )}
                  {estadoActual === 3 && (
                    <p>Cotización lista. Completa servicios y refacciones, luego avanza para esperar aprobación.</p>
                  )}
                  {estadoActual === 4 && (
                    <p>Presupuesto aprobado. Avanza a "En Trabajo" para iniciar las reparaciones.</p>
                  )}
                  {estadoActual === 5 && (
                    <p>Trabajo en progreso. Avanza cuando necesites refacciones o cuando termines.</p>
                  )}
                  {estadoActual === 6 && (
                    <p>Esperando refacciones. Avanza cuando lleguen las piezas necesarias.</p>
                  )}
                  {estadoActual === 7 && (
                    <p>Realizando pruebas finales. Avanza cuando esté listo para entrega.</p>
                  )}
                  {estadoActual === 8 && (
                    <p>Vehículo listo para entrega. Haz clic en "Marcar Entregado" cuando el cliente recoja el vehículo.</p>
                  )}
                  {estadoActual === 9 && (
                    <p>Vehículo entregado. Esta orden ha sido completada.</p>
                  )}
                  {estadoActual === 10 && (
                    <p>Orden cancelada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 no-print">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-1">SAG Garage - Sistema de Presupuestos</p>
            <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
          </div>
        </div>
      </footer>

      {/* Modal de Confirmación para Marcar como Entregado */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Marcar como Entregado?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿El vehículo ha sido entregado al cliente? Esta acción marcará la orden como completada.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCloseModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCloseOrden}
                className="flex-1"
              >
                Sí, Marcar como Entregado
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {showLoader && <GarageLoader onComplete={handleLoaderComplete} />}
    </div>
  );
};