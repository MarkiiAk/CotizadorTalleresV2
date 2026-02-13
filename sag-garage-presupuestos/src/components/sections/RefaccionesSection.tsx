import React, { useState } from 'react';
import { Plus, X, Package } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';

interface RefaccionesSectionProps {
  disabled?: boolean;
}

export const RefaccionesSection: React.FC<RefaccionesSectionProps> = ({ disabled = false }) => {
  const { presupuesto, addRefaccion, deleteRefaccion } = usePresupuestoStore();
  const { refacciones } = presupuesto;
  
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [margenGanancia] = useState(30); // 30% fijo de ganancia

  const handleAddRefaccion = () => {
    const cantidadNum = parseInt(cantidad);
    const precioCostoNum = parseFloat(precioCosto);

    if (nombre && cantidadNum > 0 && precioCostoNum > 0) {
      addRefaccion({
        nombre,
        cantidad: cantidadNum,
        precioCosto: precioCostoNum,
        precioVenta: 0, // Se calcula automáticamente en el store
        margenGanancia,
      });
      
      // Reset form
      setNombre('');
      setCantidad('');
      setPrecioCosto('');
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
      title="Refacciones"
      subtitle="Agrega las refacciones necesarias para la reparación"
      className="p-6"
    >
      {/* Lista de refacciones agregadas */}
      {refacciones.length > 0 && (
        <div className="mb-6 space-y-3">
          {refacciones.map((refaccion) => (
            <div
              key={refaccion.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3 flex-1">
                <Package className="text-sag-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {refaccion.nombre}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>Cant: {refaccion.cantidad}</span>
                    <span>Precio Unit: {formatCurrency(refaccion.precioVenta)}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Total: {formatCurrency(refaccion.total)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="danger"
                onClick={() => deleteRefaccion(refaccion.id)}
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
          <span>Agregar Refacción</span>
        </button>
      )}

      {/* Formulario para agregar refacción */}
      {showForm && (
        <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Refacción"
              placeholder="Ej: Filtro de aceite"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={disabled}
            />

            <Input
              label="Cantidad"
              type="number"
              placeholder="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              required
              disabled={disabled}
            />

            <Input
              label="Precio de Costo"
              type="number"
              placeholder="0.00"
              value={precioCosto}
              onChange={(e) => setPrecioCosto(e.target.value)}
              min="0"
              step="0.01"
              required
              disabled={disabled}
            />
          </div>

          {cantidad && precioCosto && parseInt(cantidad) > 0 && parseFloat(precioCosto) > 0 && (
            <div className="p-4 bg-sag-50 dark:bg-sag-900/20 rounded-lg border border-sag-200 dark:border-sag-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Precio de Costo:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(parseFloat(precioCosto))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sag-700 dark:text-sag-300">
                  Margen de Ganancia ({margenGanancia}%):
                </span>
                <span className="font-medium text-sag-700 dark:text-sag-300">
                  + {formatCurrency(parseFloat(precioCosto) * (margenGanancia / 100))}
                </span>
              </div>
              <div className="h-px bg-sag-200 dark:bg-sag-800"></div>
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Precio de Venta:
                </span>
                <span className="font-bold text-sag-600 dark:text-sag-400">
                  {formatCurrency(parseFloat(precioCosto) * (1 + margenGanancia / 100))}
                </span>
              </div>
              <div className="h-px bg-sag-200 dark:bg-sag-800"></div>
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Total Estimado:
                </span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(
                    parseInt(cantidad) * parseFloat(precioCosto) * (1 + margenGanancia / 100)
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="success"
              onClick={handleAddRefaccion}
              icon={<Plus size={20} />}
              disabled={
                disabled ||
                !nombre ||
                !cantidad ||
                !precioCosto ||
                parseInt(cantidad) <= 0 ||
                parseFloat(precioCosto) <= 0
              }
            >
              Agregar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setNombre('');
                setCantidad('');
                setPrecioCosto('');
              }}
              disabled={disabled}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {refacciones.length === 0 && !showForm && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay refacciones agregadas. Haz clic en "Agregar Refacción" para comenzar.
        </p>
      )}
    </Card>
  );
};
