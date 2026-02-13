import React, { useState } from 'react';
import { Plus, X, Wrench } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';
import { SERVICIOS_COMUNES } from '../../constants/servicios';

interface ServiciosSectionProps {
  disabled?: boolean;
}

export const ServiciosSection: React.FC<ServiciosSectionProps> = ({ disabled = false }) => {
  const { presupuesto, addServicio, deleteServicio } = usePresupuestoStore();
  const { servicios } = presupuesto;
  
  const [showForm, setShowForm] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState('');
  const [customServicio, setCustomServicio] = useState('');
  const [precio, setPrecio] = useState('');

  const handleAddServicio = () => {
    const descripcion = selectedServicio === 'otro' ? customServicio : selectedServicio;
    const precioNum = parseFloat(precio);

    if (descripcion && precioNum > 0) {
      addServicio({
        descripcion,
        precio: precioNum,
      });
      
      // Reset form
      setSelectedServicio('');
      setCustomServicio('');
      setPrecio('');
      setShowForm(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <Card
      title="Servicios"
      subtitle="Selecciona o agrega los servicios a realizar"
      className="p-6"
    >
      {/* Lista de servicios agregados */}
      {servicios.length > 0 && (
        <div className="mb-6 space-y-3">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <Wrench className="text-sag-600" size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {servicio.descripcion}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(servicio.precio)}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                onClick={() => deleteServicio(servicio.id)}
                icon={<X size={16} />}
                className="!p-2"
                disabled={disabled}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Botón para mostrar formulario */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-white dark:bg-gray-900
                     border-2 border-sag-500 dark:border-sag-400
                     text-sag-600 dark:text-sag-400 font-medium rounded-lg
                     hover:bg-sag-50 dark:hover:bg-sag-950/30
                     active:bg-sag-100 dark:active:bg-sag-950/50
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-900"
        >
          <Plus size={20} />
          <span>Agregar Servicio</span>
        </button>
      )}

      {/* Formulario para agregar servicio */}
      {showForm && (
        <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Servicio</label>
              <select
                className="input"
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                disabled={disabled}
              >
                <option value="">Selecciona un servicio</option>
                {SERVICIOS_COMUNES.map((servicio, index) => (
                  <option key={index} value={servicio}>
                    {servicio}
                  </option>
                ))}
                <option value="otro">Otro (personalizado)</option>
              </select>
            </div>

            {selectedServicio === 'otro' && (
              <Input
                label="Nombre del Servicio"
                placeholder="Ej: Reparación de motor"
                value={customServicio}
                onChange={(e) => setCustomServicio(e.target.value)}
                disabled={disabled}
              />
            )}

            <Input
              label="Precio"
              type="number"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
              disabled={disabled}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={handleAddServicio}
              icon={<Plus size={20} />}
              disabled={
                disabled ||
                !selectedServicio ||
                (selectedServicio === 'otro' && !customServicio) ||
                !precio ||
                parseFloat(precio) <= 0
              }
            >
              Agregar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setSelectedServicio('');
                setCustomServicio('');
                setPrecio('');
              }}
              disabled={disabled}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {servicios.length === 0 && !showForm && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay servicios agregados. Haz clic en "Agregar Servicio" para comenzar.
        </p>
      )}
    </Card>
  );
};
