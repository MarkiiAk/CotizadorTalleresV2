import { useEffect, useState } from 'react';
import { Sun, Moon, FileText, Download, Save, ArrowLeft, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useNavigate, useParams } from 'react-router-dom';
import { usePresupuestoStore } from '../store/usePresupuestoStore';
import { ordenesAPI } from '../services/api';
import { GarageLoader } from '../components/ui/GarageLoader';
import { mergePDFWithGarantia } from '../utils/pdfMerger';
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

export const DetalleOrden = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { presupuesto, themeMode, toggleTheme, loadFromOrden, resetPresupuesto, markAsSaved } = usePresupuestoStore();
  const [showLoader, setShowLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orden, setOrden] = useState<Orden | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Normalizar estado: mapear "pendiente" a "abierta" para compatibilidad
  const estadoNormalizado = orden?.estado === 'pendiente' ? 'abierta' : orden?.estado;

  // Aplicar el tema al documento
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Cargar orden
  useEffect(() => {
    const cargarOrden = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('📋 Cargando orden desde API:', id);
        const ordenData = await ordenesAPI.getById(id);
        console.log('✅ Orden cargada:', ordenData);
        if (ordenData) {
          setOrden(ordenData);
          loadFromOrden(ordenData);
        } else {
          alert('Orden no encontrada');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error al cargar orden:', error);
        alert('Error al cargar la orden');
        navigate('/dashboard');
      } finally {
        // Pequeño delay para asegurar que el loader sea visible
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    cargarOrden();
  }, [id, navigate, loadFromOrden]);

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
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.');
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
          nivelCombustible: presupuesto.vehiculo.nivelGasolina, // Mapear para backend
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
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setShowLoader(false);
      alert('Hubo un error al guardar los cambios. Por favor intenta de nuevo.');
    }
  };

  const handleCloseOrden = async () => {
    if (!id) return;

    try {
      setShowLoader(true);
      console.log('🔒 Cerrando orden en API...');
      await ordenesAPI.update(id, { estado: 'cerrada' });
      console.log('✅ Orden cerrada exitosamente');
      setShowCloseModal(false);
      // Después de cerrar, recargar la orden para actualizar el estado local
      const ordenActualizada = await ordenesAPI.getById(id);
      if (ordenActualizada) {
        setOrden(ordenActualizada);
      }
    } catch (error) {
      console.error('Error al cerrar orden:', error);
      setShowLoader(false);
      setShowCloseModal(false);
      alert('Hubo un error al cerrar la orden. Por favor intenta de nuevo.');
    }
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    resetPresupuesto();
    navigate('/dashboard');
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estado: <span className={estadoNormalizado === 'abierta' ? 'text-sag-600' : 'text-gray-600'}>
                    {estadoNormalizado === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </span>
                </p>
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

              {/* Guardar Cambios - Solo si está abierta */}
              {estadoNormalizado === 'abierta' && (
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  icon={<Save size={20} />}
                  disabled={showLoader}
                  className="hidden md:flex"
                >
                  Guardar Cambios
                </Button>
              )}

              {/* Cerrar Orden - Solo si está abierta */}
              {estadoNormalizado === 'abierta' && (
                <Button
                  variant="danger"
                  onClick={() => setShowCloseModal(true)}
                  icon={<X size={20} />}
                  disabled={showLoader}
                  className="hidden md:flex"
                >
                  Cerrar Orden
                </Button>
              )}

              {/* Generar PDF */}
              <Button
                variant="success"
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
            {estadoNormalizado === 'abierta' && (
              <>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  icon={<Save size={18} />}
                  disabled={showLoader}
                  className="flex-1 !text-sm"
                >
                  Guardar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowCloseModal(true)}
                  icon={<X size={18} />}
                  disabled={showLoader}
                  className="flex-1 !text-sm"
                >
                  Cerrar
                </Button>
              </>
            )}
            <Button
              variant="success"
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Información del Vehículo */}
          <VehiculoSection disabled={estadoNormalizado === 'cerrada'} />

          {/* Información del Cliente */}
          <ClienteSection disabled={estadoNormalizado === 'cerrada'} />

          {/* Inspección Visual del Vehículo */}
          <InspeccionSection disabled={estadoNormalizado === 'cerrada'} />

          {/* Puntos de Seguridad */}
          <PuntosSeguridadSection 
            puntosSeguridad={presupuesto.puntosSeguridad || []}
            onChange={(puntos) => usePresupuestoStore.getState().updatePuntosSeguridad(puntos)}
            disabled={estadoNormalizado === 'cerrada'}
          />

          {/* Problema y Diagnóstico */}
          <ProblemaSection disabled={estadoNormalizado === 'cerrada'} />

          {/* Servicios */}
          <ServiciosSection disabled={estadoNormalizado === 'cerrada'} />

          {/* Refacciones y Mano de Obra */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RefaccionesSection disabled={estadoNormalizado === 'cerrada'} />
            <ManoObraSection disabled={estadoNormalizado === 'cerrada'} />
          </div>

          {/* Resumen Financiero */}
          <ResumenSection />

          {/* Garantía */}
          <GarantiaSection />
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

      {/* Modal de Confirmación para Cerrar Orden */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cerrar Orden?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Una vez cerrada, no podrás hacer más cambios a esta orden. ¿Estás seguro de que deseas continuar?
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
                variant="danger"
                onClick={handleCloseOrden}
                className="flex-1"
              >
                Sí, Cerrar Orden
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
