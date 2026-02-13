import { useEffect, useState } from 'react';
import { Sun, Moon, FileText, Download, Save, ArrowLeft } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import { usePresupuestoStore } from '../store/usePresupuestoStore';
import { ordenesAPI } from '../services/api';
import { GarageLoader } from '../components/ui/GarageLoader';
import { useToastContext } from '../contexts/ToastContext';
import { handleAPIError } from '../utils/errorHandler';
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

export const NuevaOrden = () => {
  const navigate = useNavigate();
  const { presupuesto, themeMode, toggleTheme, resetPresupuesto, markAsSaved } = usePresupuestoStore();
  const { showSuccess, showError } = useToastContext();
  const [showLoader, setShowLoader] = useState(false);

  // Limpiar formulario al montar el componente
  useEffect(() => {
    resetPresupuesto();
  }, [resetPresupuesto]);

  // Aplicar el tema al documento
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Calcular resumen al cargar
  useEffect(() => {
    usePresupuestoStore.getState().calcularResumen();
  }, []);

  const handleGeneratePDF = async () => {
    try {
      const blob = await pdf(<PDFDocument presupuesto={presupuesto} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const nombreCliente = presupuesto.cliente.nombreCompleto.replace(/\s+/g, '_').toUpperCase();
      const modelo = presupuesto.vehiculo.modelo.replace(/\s+/g, '_').toUpperCase();
      link.download = `SAG_Garage_${presupuesto.folio}_${modelo}_${nombreCliente}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess(
        'PDF Generado',
        'El archivo PDF se ha descargado correctamente'
      );
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showError(
        'Error al generar PDF',
        'No se pudo generar el archivo PDF. Intenta de nuevo.'
      );
    }
  };

  // Función para validar campos requeridos del cliente
  const validateCliente = () => {
    const errors: string[] = [];
    
    if (!presupuesto.cliente.nombreCompleto?.trim()) {
      errors.push('El nombre completo del cliente es requerido');
    } else if (presupuesto.cliente.nombreCompleto.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (!/^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/.test(presupuesto.cliente.nombreCompleto)) {
      errors.push('El nombre solo puede contener letras y espacios');
    }
    
    if (!presupuesto.cliente.telefono?.trim()) {
      errors.push('El teléfono del cliente es requerido');
    } else if (presupuesto.cliente.telefono.length < 10) {
      errors.push('El teléfono debe tener al menos 10 dígitos');
    }
    
    if (presupuesto.cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(presupuesto.cliente.email)) {
      errors.push('El formato del correo electrónico no es válido');
    }
    
    return errors;
  };

  // Función para validar campos requeridos del vehículo
  const validateVehiculo = () => {
    const errors: string[] = [];
    
    if (!presupuesto.vehiculo.marca?.trim()) {
      errors.push('La marca del vehículo es requerida');
    }
    
    if (!presupuesto.vehiculo.modelo?.trim()) {
      errors.push('El modelo del vehículo es requerido');
    }
    
    if (!presupuesto.vehiculo.placas?.trim()) {
      errors.push('Las placas del vehículo son requeridas');
    } else if (presupuesto.vehiculo.placas.length < 6) {
      errors.push('Las placas deben tener al menos 6 caracteres');
    }
    
    if (!presupuesto.vehiculo.kilometrajeEntrada?.trim()) {
      errors.push('El kilometraje de entrada es requerido');
    } else if (isNaN(Number(presupuesto.vehiculo.kilometrajeEntrada)) || Number(presupuesto.vehiculo.kilometrajeEntrada) < 0) {
      errors.push('El kilometraje de entrada debe ser un número válido');
    }
    
    return errors;
  };

  // Función para validar todos los campos
  const validateForm = () => {
    const clienteErrors = validateCliente();
    const vehiculoErrors = validateVehiculo();
    
    const allErrors = [...clienteErrors, ...vehiculoErrors];
    
    if (allErrors.length > 0) {
      showError(
        'Errores de validación',
        'Por favor corrige los siguientes errores:',
        allErrors
      );
      return false;
    }
    
    return true;
  };

  const handleSaveOrden = async () => {
    // Primero validar los campos del lado del cliente
    if (!validateForm()) {
      return; // Detener ejecución si hay errores de validación
    }

    // Si las validaciones pasan, entonces mostrar loading y proceder
    try {
      setShowLoader(true);
      
      // Convertir presupuesto a Orden
      const orden = {
        id: presupuesto.id,
        folio: presupuesto.folio,
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
        estado: 'abierta' as const,
        fechaCreacion: presupuesto.fecha.toISOString(),
        fechaModificacion: new Date().toISOString(),
      };
      
      console.log('💾 Guardando orden en API...');
      const result = await ordenesAPI.create(orden);
      console.log('✅ Orden guardada exitosamente');
      
      markAsSaved();
      showSuccess(
        'Orden guardada exitosamente',
        `La orden ${result.folio} ha sido creada correctamente`
      );
    } catch (error) {
      console.error('Error al guardar la orden:', error);
      setShowLoader(false);
      handleAPIError(error, showError, 'Error al guardar la orden');
    }
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    resetPresupuesto();
    navigate('/dashboard');
  };


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
                  Nueva Orden
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crear presupuesto
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

              {/* Guardar Orden */}
              <Button
                variant="primary"
                onClick={handleSaveOrden}
                icon={<Save size={20} />}
                disabled={showLoader}
                className="hidden md:flex"
              >
                Guardar Orden
              </Button>

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
            <Button
              variant="primary"
              onClick={handleSaveOrden}
              icon={<Save size={18} />}
              disabled={showLoader}
              className="flex-1 !text-sm"
            >
              Guardar
            </Button>
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
          <VehiculoSection />

          {/* Información del Cliente */}
          <ClienteSection />

          {/* Inspección Visual del Vehículo */}
          <InspeccionSection />

          {/* Puntos de Seguridad */}
          <PuntosSeguridadSection 
            puntosSeguridad={presupuesto.puntosSeguridad || []}
            onChange={(puntos) => usePresupuestoStore.getState().updatePuntosSeguridad(puntos)}
          />

          {/* Problema y Diagnóstico */}
          <ProblemaSection />

          {/* Servicios */}
          <ServiciosSection />

          {/* Refacciones y Mano de Obra */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RefaccionesSection />
            <ManoObraSection />
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

      {/* Loader */}
      {showLoader && <GarageLoader onComplete={handleLoaderComplete} />}
    </div>
  );
};
