import React, { useState } from 'react';
import { Plus, X, HardHat } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';

interface ManoObraSectionProps {
  disabled?: boolean;
}

export const ManoObraSection: React.FC<ManoObraSectionProps> = ({ disabled = false }) => {
  const { presupuesto, addManoDeObra, deleteManoDeObra } = usePresupuestoStore();
  const { manoDeObra } = presupuesto;
  
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  const handleAddManoObra = () => {
    const precioNum = parseFloat(precio);

    if (descripcion && precioNum > 0) {
      addManoDeObra({
        descripcion,
        precio: precioNum,
      });
      
      // Reset form
      setDescripcion('');
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
      title="Mano de Obra"
      subtitle="Agrega los conceptos de mano de obra"
      className="p-6"
    >
      {/* Lista de mano de obra agregada */}
      {manoDeObra.length > 0 && (
        <div className="mb-6 space-y-3">
          {manoDeObra.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <HardHat className="text-sag-600 dark:text-sag-400" size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.descripcion}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.precio)}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                onClick={() => deleteManoDeObra(item.id)}
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
          <span>Agregar Mano de Obra</span>
        </button>
      )}

      {/* Formulario para agregar mano de obra */}
      {showForm && (
        <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Descripción del Trabajo"
              placeholder="Ej: Instalación de frenos"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              disabled={disabled}
            />

            <Input
              label="Precio"
              type="number"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              min="0"
              step="0.01"
              required
              disabled={disabled}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={handleAddManoObra}
              icon={<Plus size={20} />}
              disabled={
                disabled ||
                !descripcion ||
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
                setDescripcion('');
                setPrecio('');
              }}
              disabled={disabled}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {manoDeObra.length === 0 && !showForm && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay conceptos de mano de obra agregados. Haz clic en "Agregar Mano de Obra" para comenzar.
        </p>
      )}
    </Card>
  );
};
