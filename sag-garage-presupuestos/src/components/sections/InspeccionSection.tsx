import React from 'react';
import { ClipboardCheck, X, AlertTriangle } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';
import { DanoVehiculo } from '../../types';

interface InspeccionSectionProps {
  disabled?: boolean;
}

export const InspeccionSection: React.FC<InspeccionSectionProps> = ({ disabled = false }) => {
  const { presupuesto } = usePresupuestoStore();
  
  // Asegurar que inspeccion siempre tenga una estructura válida
  const inspeccion = React.useMemo(() => {
    if (!presupuesto.inspeccion) {
      return {
        exteriores: {
          lucesFrontales: true,
          cuartoLuces: true,
          antena: true,
          espejosLaterales: true,
          cristales: true,
          emblemas: true,
          llantas: true,
          taponRuedas: true,
          moldurasCompletas: true,
          taponGasolina: true,
          limpiadores: true,
        },
        interiores: {
          instrumentoTablero: true,
          calefaccion: true,
          sistemaSonido: true,
          bocinas: true,
          espejoRetrovisor: true,
          cinturones: true,
          botoniaGeneral: true,
          manijas: true,
          tapetes: true,
          vestiduras: true,
          otros: true,
        },
        danosAdicionales: [],
      };
    }
    
    // Asegurar que exteriores e interiores existen
    return {
      exteriores: presupuesto.inspeccion.exteriores || {
        lucesFrontales: true,
        cuartoLuces: true,
        antena: true,
        espejosLaterales: true,
        cristales: true,
        emblemas: true,
        llantas: true,
        taponRuedas: true,
        moldurasCompletas: true,
        taponGasolina: true,
        limpiadores: true,
      },
      interiores: presupuesto.inspeccion.interiores || {
        instrumentoTablero: true,
        calefaccion: true,
        sistemaSonido: true,
        bocinas: true,
        espejoRetrovisor: true,
        cinturones: true,
        botoniaGeneral: true,
        manijas: true,
        tapetes: true,
        vestiduras: true,
        otros: true,
      },
      danosAdicionales: presupuesto.inspeccion.danosAdicionales || [],
    };
  }, [presupuesto.inspeccion]);

  const [nuevoDano, setNuevoDano] = React.useState<Omit<DanoVehiculo, 'id'>>({
    ubicacion: '',
    tipo: '',
    descripcion: '',
  });

  const handleCheckboxChange = (section: 'exteriores' | 'interiores', field: string) => {
    const store = usePresupuestoStore.getState();
    
    // Inicializar inspeccion si no existe
    if (!store.presupuesto.inspeccion) {
      store.presupuesto.inspeccion = {
        exteriores: { ...inspeccion.exteriores },
        interiores: { ...inspeccion.interiores },
        danosAdicionales: [],
      };
    }
    
    const sectionData = store.presupuesto.inspeccion[section] as any;
    sectionData[field] = !sectionData[field];
    usePresupuestoStore.setState({ presupuesto: { ...store.presupuesto } });
  };

  const agregarDano = () => {
    if (nuevoDano.ubicacion && nuevoDano.tipo) {
      const store = usePresupuestoStore.getState();
      
      // Inicializar inspeccion si no existe
      if (!store.presupuesto.inspeccion) {
        store.presupuesto.inspeccion = {
          exteriores: { ...inspeccion.exteriores },
          interiores: { ...inspeccion.interiores },
          danosAdicionales: [],
        };
      }
      
      const newDano: DanoVehiculo = {
        ...nuevoDano,
        id: Math.random().toString(36).substring(2, 11),
      };
      
      // Crear nuevo array inmutable en lugar de mutar
      const nuevosDanos = [...(store.presupuesto.inspeccion.danosAdicionales || []), newDano];
      
      usePresupuestoStore.setState({ 
        presupuesto: {
          ...store.presupuesto,
          inspeccion: {
            ...store.presupuesto.inspeccion,
            danosAdicionales: nuevosDanos
          }
        }
      });
      
      setNuevoDano({ ubicacion: '', tipo: '', descripcion: '' });
    }
  };

  const eliminarDano = (id: string) => {
    const store = usePresupuestoStore.getState();
    
    // Inicializar inspeccion si no existe
    if (!store.presupuesto.inspeccion) {
      store.presupuesto.inspeccion = {
        exteriores: { ...inspeccion.exteriores },
        interiores: { ...inspeccion.interiores },
        danosAdicionales: [],
      };
    }
    
    // Crear nuevo array inmutable filtrado
    const danosFiltrados = (store.presupuesto.inspeccion.danosAdicionales || []).filter(d => d.id !== id);
    
    usePresupuestoStore.setState({ 
      presupuesto: {
        ...store.presupuesto,
        inspeccion: {
          ...store.presupuesto.inspeccion,
          danosAdicionales: danosFiltrados
        }
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <ChecklistItem
              label="Luces Frontales"
              checked={inspeccion.exteriores.lucesFrontales}
              onChange={() => handleCheckboxChange('exteriores', 'lucesFrontales')}
            />
            <ChecklistItem
              label="Cuarto de Luces"
              checked={inspeccion.exteriores.cuartoLuces}
              onChange={() => handleCheckboxChange('exteriores', 'cuartoLuces')}
            />
            <ChecklistItem
              label="Antena"
              checked={inspeccion.exteriores.antena}
              onChange={() => handleCheckboxChange('exteriores', 'antena')}
            />
            <ChecklistItem
              label="Espejos Laterales"
              checked={inspeccion.exteriores.espejosLaterales}
              onChange={() => handleCheckboxChange('exteriores', 'espejosLaterales')}
            />
            <ChecklistItem
              label="Cristales"
              checked={inspeccion.exteriores.cristales}
              onChange={() => handleCheckboxChange('exteriores', 'cristales')}
            />
            <ChecklistItem
              label="Emblemas"
              checked={inspeccion.exteriores.emblemas}
              onChange={() => handleCheckboxChange('exteriores', 'emblemas')}
            />
            <ChecklistItem
              label="Llantas"
              checked={inspeccion.exteriores.llantas}
              onChange={() => handleCheckboxChange('exteriores', 'llantas')}
            />
            <ChecklistItem
              label="Tapón de Ruedas"
              checked={inspeccion.exteriores.taponRuedas}
              onChange={() => handleCheckboxChange('exteriores', 'taponRuedas')}
            />
            <ChecklistItem
              label="Molduras Completas"
              checked={inspeccion.exteriores.moldurasCompletas}
              onChange={() => handleCheckboxChange('exteriores', 'moldurasCompletas')}
            />
            <ChecklistItem
              label="Tapón de Gasolina"
              checked={inspeccion.exteriores.taponGasolina}
              onChange={() => handleCheckboxChange('exteriores', 'taponGasolina')}
            />
            <ChecklistItem
              label="Limpiadores"
              checked={inspeccion.exteriores.limpiadores}
              onChange={() => handleCheckboxChange('exteriores', 'limpiadores')}
            />
          </div>
        </div>

        {/* Interiores */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-sag-600" />
            Accesorios Interiores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <ChecklistItem
              label="Instrumento de Tablero"
              checked={inspeccion.interiores.instrumentoTablero}
              onChange={() => handleCheckboxChange('interiores', 'instrumentoTablero')}
            />
            <ChecklistItem
              label="Calefacción"
              checked={inspeccion.interiores.calefaccion}
              onChange={() => handleCheckboxChange('interiores', 'calefaccion')}
            />
            <ChecklistItem
              label="Sistema de Sonido"
              checked={inspeccion.interiores.sistemaSonido}
              onChange={() => handleCheckboxChange('interiores', 'sistemaSonido')}
            />
            <ChecklistItem
              label="Bocinas"
              checked={inspeccion.interiores.bocinas}
              onChange={() => handleCheckboxChange('interiores', 'bocinas')}
            />
            <ChecklistItem
              label="Espejo Retrovisor"
              checked={inspeccion.interiores.espejoRetrovisor}
              onChange={() => handleCheckboxChange('interiores', 'espejoRetrovisor')}
            />
            <ChecklistItem
              label="Cinturones"
              checked={inspeccion.interiores.cinturones}
              onChange={() => handleCheckboxChange('interiores', 'cinturones')}
            />
            <ChecklistItem
              label="Botonería General"
              checked={inspeccion.interiores.botoniaGeneral}
              onChange={() => handleCheckboxChange('interiores', 'botoniaGeneral')}
            />
            <ChecklistItem
              label="Manijas"
              checked={inspeccion.interiores.manijas}
              onChange={() => handleCheckboxChange('interiores', 'manijas')}
            />
            <ChecklistItem
              label="Tapetes"
              checked={inspeccion.interiores.tapetes}
              onChange={() => handleCheckboxChange('interiores', 'tapetes')}
            />
            <ChecklistItem
              label="Vestiduras"
              checked={inspeccion.interiores.vestiduras}
              onChange={() => handleCheckboxChange('interiores', 'vestiduras')}
            />
            <ChecklistItem
              label="Otros"
              checked={inspeccion.interiores.otros}
              onChange={() => handleCheckboxChange('interiores', 'otros')}
            />
          </div>
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
