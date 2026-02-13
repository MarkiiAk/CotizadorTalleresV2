import React from 'react';
import { Car, Gauge } from 'lucide-react';
import { Card, FormField, FuelGauge } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';

interface VehiculoSectionProps {
  disabled?: boolean;
}

export const VehiculoSection: React.FC<VehiculoSectionProps> = ({ disabled = false }) => {
  const { presupuesto, updateVehiculo } = usePresupuestoStore();
  const { vehiculo } = presupuesto;

  const handleChange = (field: keyof typeof vehiculo) => (value: string) => {
    updateVehiculo({ [field]: value });
  };

  const handleFuelChange = (level: number) => {
    updateVehiculo({ nivelGasolina: level });
  };

  return (
    <Card
      title="Información del Vehículo"
      subtitle="Datos del automóvil y condiciones de entrada"
      className="p-6"
    >
      <div className="space-y-8">
        {/* Datos básicos del vehículo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Car size={20} className="text-sag-600" />
            Datos del Vehículo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              name="marca"
              label="🚗 Marca"
              placeholder="Ej: Toyota, Honda, Ford"
              value={vehiculo.marca}
              onChange={handleChange('marca')}
              required
              disabled={disabled}
              validation={{
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[A-Za-z0-9À-ÿ\u00f1\u00d1\s\-]+$/,
              }}
            />
            
            <FormField
              name="modelo"
              label="🚙 Modelo"
              placeholder="Ej: Corolla 2020"
              value={vehiculo.modelo}
              onChange={handleChange('modelo')}
              required
              disabled={disabled}
              validation={{
                required: true,
                minLength: 2,
                maxLength: 50,
              }}
            />
            
            <FormField
              name="color"
              label="🎨 Color"
              placeholder="Ej: Blanco, Negro, Rojo"
              value={vehiculo.color}
              onChange={handleChange('color')}
              disabled={disabled}
              validation={{
                maxLength: 30,
                pattern: /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]+$/,
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              name="placas"
              label="Placas"
              type="text"
              value={presupuesto.vehiculo.placas}
              onChange={(value) => updateVehiculo({ placas: value.toUpperCase() })}
              required
              validation={{
                required: true,
                minLength: 6,
                maxLength: 10
              }}
              placeholder="ABC123D"
            />
            
            <FormField
              name="niv"
              label="🔢 NIV (VIN)"
              placeholder="Número de Identificación Vehicular"
              value={vehiculo.niv}
              onChange={handleChange('niv')}
              disabled={disabled}
              validation={{
                maxLength: 17,
                custom: (value) => {
                  if (value && value.length > 17) {
                    return 'NIV (VIN) debe tener al menos 17 caracteres';
                  }
                  return null;
                }
              }}
            />
          </div>
        </div>

        {/* Kilometraje y fechas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Gauge size={20} className="text-sag-600" />
            Kilometraje y Fechas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              name="kilometrajeEntrada"
              label="📊 Kms de Entrada"
              type="number"
              placeholder="50000"
              value={vehiculo.kilometrajeEntrada}
              onChange={handleChange('kilometrajeEntrada')}
              required
              disabled={disabled}
              validation={{
                required: true,
                number: true,
                min: 0,
                max: 999999,
              }}
            />
            
            <FormField
              name="kilometrajeSalida"
              label="📈 Kms de Salida"
              type="number"
              placeholder="50050"
              value={vehiculo.kilometrajeSalida}
              onChange={handleChange('kilometrajeSalida')}
              disabled={disabled}
              validation={{
                number: true,
                min: 0,
                max: 999999,
                custom: (value) => {
                  if (value && vehiculo.kilometrajeEntrada) {
                    const entrada = parseFloat(vehiculo.kilometrajeEntrada);
                    const salida = parseFloat(value);
                    if (!isNaN(entrada) && !isNaN(salida) && salida < entrada) {
                      return 'El kilometraje de salida debe ser mayor al de entrada';
                    }
                  }
                  return null;
                }
              }}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Entrada
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={(() => {
                    const fecha = presupuesto.fechaEntrada;
                    if (!fecha) return '';
                    try {
                      const dateObj = fecha instanceof Date ? fecha : new Date(fecha as any);
                      if (isNaN(dateObj.getTime())) return '';
                      // Usar fecha local en lugar de UTC
                      const year = dateObj.getFullYear();
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    const store = usePresupuestoStore.getState();
                    store.presupuesto.fechaEntrada = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date();
                    usePresupuestoStore.setState({ presupuesto: store.presupuesto });
                  }}
                  disabled={disabled}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-0 focus:border-sag-600 dark:focus:border-sag-500 transition-all duration-200 ease-out disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Salida
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={(() => {
                    const fecha = presupuesto.fechaSalida;
                    if (!fecha) return '';
                    try {
                      const dateObj = fecha instanceof Date ? fecha : new Date(fecha as any);
                      if (isNaN(dateObj.getTime())) return '';
                      // Usar fecha local en lugar de UTC
                      const year = dateObj.getFullYear();
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    const store = usePresupuestoStore.getState();
                    store.presupuesto.fechaSalida = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    usePresupuestoStore.setState({ presupuesto: store.presupuesto });
                  }}
                  disabled={disabled}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-0 focus:border-sag-600 dark:focus:border-sag-500 transition-all duration-200 ease-out disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nivel de gasolina */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Gauge size={20} className="text-sag-600" />
            Estado de Gasolina
          </h3>
          <div className="max-w-md">
            <FuelGauge
              level={vehiculo.nivelGasolina}
              onChange={handleFuelChange}
              label="Nivel de Gasolina al Ingreso"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
