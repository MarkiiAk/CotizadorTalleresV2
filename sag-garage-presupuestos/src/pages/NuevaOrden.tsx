import { useEffect, useState } from 'react';
import { Sun, Moon, FileText, Save, ArrowLeft } from 'lucide-react';
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
} from '../components/sections';
import { Button } from '../components/ui';

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

  // Función para validar problema reportado
  const validateProblema = () => {
    const errors: string[] = [];
    
    if (!presupuesto.problemaReportado?.trim()) {
      errors.push('El problema reportado por el cliente es requerido');
    }
    
    return errors;
  };

  // Función para validar todos los campos de ETAPA 1
  const validateForm = () => {
    const clienteErrors = validateCliente();
    const vehiculoErrors = validateVehiculo();
    const problemaErrors = validateProblema();
    
    const allErrors = [...clienteErrors, ...vehiculoErrors, ...problemaErrors];
    
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
      
      // Convertir presupuesto a Orden - SOLO ETAPA 1
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
        // NO incluir campos de etapas posteriores
        diagnosticoTecnico: '', // Vacío inicialmente
        servicios: [],
        refacciones: [],
        manoDeObra: [],
        resumen: { servicios: 0, refacciones: 0, manoDeObra: 0, subtotal: 0, incluirIVA: false, iva: 0, total: 0, anticipo: 0, restante: 0 },
        puntosSeguridad: [],
        fechaSalida: null,
        fechaEntrada: presupuesto.fechaEntrada?.toISOString() || presupuesto.fecha.toISOString(),
        estado: 'abierta' as const,
        estado_id: 1, // RECIBIDO
        fechaCreacion: presupuesto.fecha.toISOString(),
        fechaModificacion: new Date().toISOString(),
      };
      
      console.log('💾 Guardando orden ETAPA 1 en API...');
      const result = await ordenesAPI.create(orden);
      console.log('✅ Orden ETAPA 1 guardada exitosamente');
      
      markAsSaved();
      showSuccess(
        'Orden guardada exitosamente',
        `La orden ${result.folio} ha sido creada en estado RECIBIDO`
      );
      
      // Navegar inmediatamente después del POST exitoso
      // No esperamos el loader completo para evitar la pausa visual
      navigate(`/orden/${result.id}`);
      
    } catch (error) {
      console.error('Error al guardar la orden:', error);
      setShowLoader(false);
      handleAPIError(error, showError, 'Error al guardar la orden');
    }
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    // No reseteamos ni navegamos aquí ya que se hace directamente en handleSaveOrden
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
                  Recepción inicial - Solo datos básicos
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
                Crear Orden
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
              Crear Orden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="w-4/5 mx-auto space-y-6">
          {/* Información del Cliente */}
          <ClienteSection />

          {/* Información del Vehículo */}
          <VehiculoSection />

          {/* Problema Reportado - Sin diagnóstico técnico en ETAPA 1 */}
          <ProblemaSection showDiagnostico={false} />

          {/* Inspección Visual del Vehículo - SOLO VISUAL BÁSICA */}
          <InspeccionSection />

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Información importante
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Esta es la recepción inicial. Una vez guardada la orden, podrás continuar con:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Diagnóstico técnico detallado</li>
                    <li>Inspección de puntos de seguridad</li>
                    <li>Cotización de servicios y refacciones</li>
                  </ul>
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

      {/* Loader */}
      {showLoader && <GarageLoader onComplete={handleLoaderComplete} />}
    </div>
  );
};