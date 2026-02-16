import React from 'react';
import { ClipboardCheck, X, AlertTriangle } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';
import { DanoVehiculo, ElementoInspeccion } from '../../types';
import { elementosInspeccionAPI } from '../../services/api';

interface InspeccionSectionProps {
  disabled?: boolean;
}

export const InspeccionSection: React.FC<InspeccionSectionProps> = ({ disabled = false }) => {
  const { presupuesto, markAsChanged } = usePresupuestoStore();
  const [elementosExteriores, setElementosExteriores] = React.useState<ElementoInspeccion[]>([]);
  const [elementosInteriores, setElementosInteriores] = React.useState<ElementoInspeccion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Cargar elementos de inspección desde la API
  React.useEffect(() => {
    const cargarElementos = async () => {
      try {
        setIsLoading(true);
        const elementos = await elementosInspeccionAPI.getElementos();
        
        // Separar por categoría
        const exteriores = elementos
          .filter((elemento: ElementoInspeccion) => elemento.key.startsWith('ext_'))
          .sort((a: ElementoInspeccion, b: ElementoInspeccion) => a.orden - b.orden);
        
        const interiores = elementos
          .filter((elemento: ElementoInspeccion) => elemento.key.startsWith('int_'))
          .sort((a: ElementoInspeccion, b: ElementoInspeccion) => a.orden - b.orden);

        setElementosExteriores(exteriores);
        setElementosInteriores(interiores);
      } catch (error) {
        console.error('❌ Error cargando elementos de inspección:', error);
        // Fallback a elementos hardcodeados si hay error
        setElementosExteriores([]);
        setElementosInteriores([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarElementos();
  }, []);
  
  // Crear estructura dinámica de inspección basada en elementos de BD
  const inspeccion = React.useMemo(() => {
    const baseInspeccion = {
      exteriores: {} as Record<string, boolean>,
      interiores: {} as Record<string, boolean>,
      danosAdicionales: presupuesto.inspeccion?.danosAdicionales || [],
    };

    // Inicializar exteriores dinámicamente
    elementosExteriores.forEach(elemento => {
      const fieldKey = elemento.key.replace('ext_', '');
      baseInspeccion.exteriores[fieldKey] = presupuesto.inspeccion?.exteriores?.[fieldKey] || false;
    });

    // Inicializar interiores dinámicamente
    elementosInteriores.forEach(elemento => {
      const fieldKey = elemento.key.replace('int_', '');
      baseInspeccion.interiores[fieldKey] = presupuesto.inspeccion?.interiores?.[fieldKey] || false;
    });

    return baseInspeccion;
  }, [presupuesto.inspeccion, elementosExteriores, elementosInteriores]);

  const [nuevoDano, setNuevoDano] = React.useState<Omit<DanoVehiculo, 'id'>>({
    ubicacion: '',
    tipo: '',
    descripcion: '',
  });

  const handleCheckboxChange = (section: 'exteriores' | 'interiores', field: string) => {
    usePresupuestoStore.setState((state) => {
      // Crear una nueva estructura de inspección con el cambio
      const currentInspeccion = state.presupuesto.inspeccion || {
        exteriores: { ...inspeccion.exteriores },
        interiores: { ...inspeccion.interiores },
        danosAdicionales: [],
      };

      const currentSection = currentInspeccion[section] as any;
      const newValue = !currentSection[field];

      return {
        presupuesto: {
          ...state.presupuesto,
          inspeccion: {
            ...currentInspeccion,
            [section]: {
              ...currentSection,
              [field]: newValue
            }
          }
        },
        hasUnsavedChanges: true,
      };
    });
  };

  const agregarDano = () => {
    if (nuevoDano.ubicacion && nuevoDano.tipo) {
      usePresupuestoStore.setState((state) => {
        const currentInspeccion = state.presupuesto.inspeccion || {
          exteriores: { ...inspeccion.exteriores },
          interiores: { ...inspeccion.interiores },
          danosAdicionales: [],
        };

        const newDano: DanoVehiculo = {
          ...nuevoDano,
          id: Math.random().toString(36).substring(2, 11),
        };

        return {
          presupuesto: {
            ...state.presupuesto,
            inspeccion: {
              ...currentInspeccion,
              danosAdicionales: [...currentInspeccion.danosAdicionales, newDano]
            }
          },
          hasUnsavedChanges: true,
        };
      });
      
      setNuevoDano({ ubicacion: '', tipo: '', descripcion: '' });
    }
  };

  const eliminarDano = (id: string) => {
    usePresupuestoStore.setState((state) => {
      const currentInspeccion = state.presupuesto.inspeccion || {
        exteriores: { ...inspeccion.exteriores },
        interiores: { ...inspeccion.interiores },
        danosAdicionales: [],
      };

      return {
        presupuesto: {
          ...state.presupuesto,
          inspeccion: {
            ...currentInspeccion,
            danosAdicionales: currentInspeccion.danosAdicionales.filter(d => d.id !== id)
          }
        },
        hasUnsavedChanges: true,
      };
    });
  };

  const ChecklistItem: React.FC<{ label: string; checked: boolean; onChange: () => void }> = 
    ({ label, checked, onChange }) => (
      <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-5 h-5 text-sag-700 dark:text-sag-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-sag-600 dark:focus:ring-sag-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className={`text-sm font-medium transition-colors ${
          checked 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
        }`}>
          {label}
        </span>
      </label>
    );

  return (
    <Card
      title="Inspección Visual del Vehículo"
      subtitle="Checklist de componentes y daños registrados"
      className="p-6"
    >
      <div className="space-y-8">
        {/* Exteriores */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-sag-600" />
            Accesorios Exteriores
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">Cargando elementos...</div>
            </div>
          ) : elementosExteriores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {elementosExteriores.map((elemento) => (
                <ChecklistItem
                  key={elemento.key}
                  label={elemento.nombre}
                  checked={inspeccion.exteriores[elemento.key.replace('ext_', '')] || false}
                  onChange={() => handleCheckboxChange('exteriores', elemento.key.replace('ext_', ''))}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">No se encontraron elementos exteriores</div>
            </div>
          )}
        </div>

        {/* Interiores */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-sag-600" />
            Accesorios Interiores
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">Cargando elementos...</div>
            </div>
          ) : elementosInteriores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {elementosInteriores.map((elemento) => (
                <ChecklistItem
                  key={elemento.key}
                  label={elemento.nombre}
                  checked={inspeccion.interiores[elemento.key.replace('int_', '')] || false}
                  onChange={() => handleCheckboxChange('interiores', elemento.key.replace('int_', ''))}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">No se encontraron elementos interiores</div>
            </div>
          )}
        </div>

        {/* Daños adicionales */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Daños o Detalles Adicionales
          </h3>
          
          {/* Lista de daños existentes */}
          {inspeccion.danosAdicionales.length > 0 && (
            <div className="space-y-3 mb-6">
              {inspeccion.danosAdicionales.map((dano) => (
                <div
                  key={dano.id}
                  className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {dano.ubicacion}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded">
                        {dano.tipo}
                      </span>
                    </div>
                    {dano.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dano.descripcion}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarDano(dano.id)}
                    disabled={disabled}
                    className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar daño"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario para agregar nuevo daño */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Ubicación"
                placeholder="Ej: Puerta delantera izq."
                value={nuevoDano.ubicacion}
                onChange={(e) => setNuevoDano({ ...nuevoDano, ubicacion: e.target.value })}
                disabled={disabled}
              />
              <Input
                label="Tipo de Daño"
                placeholder="Ej: Rayón, Golpe, Abolladura"
                value={nuevoDano.tipo}
                onChange={(e) => setNuevoDano({ ...nuevoDano, tipo: e.target.value })}
                disabled={disabled}
              />
              <Input
                label="Descripción (opcional)"
                placeholder="Detalles adicionales"
                value={nuevoDano.descripcion}
                onChange={(e) => setNuevoDano({ ...nuevoDano, descripcion: e.target.value })}
                disabled={disabled}
              />
            </div>
            <Button
              variant="secondary"
              onClick={agregarDano}
              disabled={disabled || !nuevoDano.ubicacion || !nuevoDano.tipo}
              className="w-full md:w-auto md:min-w-[180px]"
            >
             + Agregar Daño
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
