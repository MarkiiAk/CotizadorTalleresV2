import React from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Card, Input } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';

export const ResumenSection: React.FC = () => {
  const { presupuesto, updateAnticipo, toggleIVA } = usePresupuestoStore();
  const { resumen } = presupuesto;
  const [anticipoDisplay, setAnticipoDisplay] = React.useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const formatInputCurrency = (value: string) => {
    // Remover todo excepto números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return numericValue;
  };

  const handleAnticipoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatInputCurrency(rawValue);
    setAnticipoDisplay(formattedValue);
    
    const numericValue = parseFloat(formattedValue) || 0;
    updateAnticipo(numericValue);
  };

  const handleAnticipoFocus = () => {
    // Cuando el campo gana foco, mostrar el valor numérico sin formato
    if (resumen.anticipo > 0) {
      setAnticipoDisplay(resumen.anticipo.toString());
    }
  };

  const handleAnticipoBlur = () => {
    // Cuando el campo pierde foco, formatear el valor
    if (resumen.anticipo > 0) {
      setAnticipoDisplay(formatCurrency(resumen.anticipo));
    } else {
      setAnticipoDisplay('');
    }
  };

  // Inicializar el display cuando cambia el anticipo externamente
  React.useEffect(() => {
    if (resumen.anticipo > 0 && document.activeElement?.id !== 'anticipo-input') {
      setAnticipoDisplay(formatCurrency(resumen.anticipo));
    } else if (resumen.anticipo === 0) {
      setAnticipoDisplay('');
    }
  }, [resumen.anticipo]);

  return (
    <Card
      title="Resumen Financiero"
      subtitle="Desglose de costos y totales"
      className="p-6"
    >
      <div className="space-y-6">
        {/* Desglose de conceptos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Servicios
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(resumen.servicios)}
            </p>
          </div>

          <div className="p-4 bg-sag-50 dark:bg-sag-900/20 rounded-lg border border-sag-200 dark:border-sag-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-sag-100 dark:bg-sag-900/40 rounded-lg">
                <TrendingUp className="text-sag-600 dark:text-sag-400" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Refacciones
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(resumen.refacciones)}
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Wallet className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mano de Obra
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(resumen.manoDeObra)}
            </p>
          </div>
        </div>

        {/* Subtotal */}
        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Subtotal
            </span>
            <span className="text-3xl font-bold text-sag-600 dark:text-sag-400">
              {formatCurrency(resumen.subtotal)}
            </span>
          </div>
        </div>

        {/* IVA Toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="incluir-iva"
                checked={resumen.incluirIVA}
                onChange={(e) => toggleIVA(e.target.checked)}
                className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor="incluir-iva"
                className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Incluir IVA (16%)
              </label>
            </div>
            {resumen.incluirIVA && (
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(resumen.iva)}
              </span>
            )}
          </div>
        </div>

        {/* Total (si incluye IVA) */}
        {resumen.incluirIVA && (
          <div className="p-6 bg-gradient-to-br from-sag-50 to-sag-100 dark:from-sag-900/20 dark:to-sag-800/20 rounded-xl border-2 border-sag-300 dark:border-sag-700">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Total con IVA
              </span>
              <span className="text-3xl font-bold text-sag-700 dark:text-sag-400">
                {formatCurrency(resumen.total)}
              </span>
            </div>
          </div>
        )}

        {/* Anticipo */}
        <div className="space-y-3">
          <Input
            id="anticipo-input"
            label="Anticipo"
            type="text"
            placeholder="$0.00"
            value={anticipoDisplay}
            onChange={handleAnticipoChange}
            onFocus={handleAnticipoFocus}
            onBlur={handleAnticipoBlur}
          />
          
          {resumen.anticipo > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Porcentaje del anticipo:
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {((resumen.anticipo / (resumen.incluirIVA ? resumen.total : resumen.subtotal)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Restante a pagar */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-300 dark:border-gray-600">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Restante a pagar
              </span>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(resumen.restante)}
              </span>
            </div>
            
            {resumen.anticipo > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Este es el monto pendiente después del anticipo
              </p>
            )}
          </div>
        </div>

        {/* Mensaje informativo */}
        {resumen.subtotal === 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              Agrega servicios, refacciones o mano de obra para ver el resumen financiero
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
