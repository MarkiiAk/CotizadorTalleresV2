import React from 'react';
import { FileText, Stethoscope } from 'lucide-react';
import { Card } from '../ui';
import { usePresupuestoStore } from '../../store/usePresupuestoStore';

interface ProblemaSectionProps {
  disabled?: boolean;
  showDiagnostico?: boolean;
}

export const ProblemaSection: React.FC<ProblemaSectionProps> = ({ disabled = false, showDiagnostico = true }) => {
  const { presupuesto } = usePresupuestoStore();

  const handleChange = (field: 'problemaReportado' | 'diagnosticoTecnico') => (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const store = usePresupuestoStore.getState();
    store.presupuesto[field] = e.target.value;
    usePresupuestoStore.setState({ presupuesto: { ...store.presupuesto } });
  };

  return (
    <Card
      title={showDiagnostico ? "Problema y Diagnóstico" : "Problema Reportado"}
      subtitle={showDiagnostico ? "Descripción del problema reportado por el cliente y diagnóstico técnico" : "Descripción del problema reportado por el cliente"}
      className="p-6"
    >
      <div className="space-y-6">
        {/* Problema reportado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FileText size={18} className="text-sag-600" />
            Problema Reportado por el Cliente
          </label>
          <textarea
            value={presupuesto.problemaReportado}
            onChange={handleChange('problemaReportado')}
            placeholder="Describe el problema o servicio solicitado por el cliente..."
            rows={6}
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-0 focus:border-sag-600 dark:focus:border-sag-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Registra exactamente lo que el cliente menciona sobre el problema del vehículo.
          </p>
        </div>

        {/* Diagnóstico técnico - Solo mostrar si showDiagnostico es true */}
        {showDiagnostico && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Stethoscope size={18} className="text-sag-600" />
              Diagnóstico Técnico
            </label>
            <textarea
              value={presupuesto.diagnosticoTecnico}
              onChange={handleChange('diagnosticoTecnico')}
              rows={5}
              placeholder="Describe el diagnóstico técnico realizado, incluyendo pruebas, verificaciones y conclusiones..."
              disabled={disabled}
              className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-0 focus:border-sag-600 dark:focus:border-sag-500 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Incluye el resultado de la inspección técnica, las causas identificadas y las reparaciones necesarias.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
