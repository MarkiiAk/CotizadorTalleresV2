import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';
import { Card } from '../ui';
import { POLIZA_GARANTIA } from '../../constants/garantia';

export const GarantiaSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      title="Póliza de Garantía"
      subtitle="Términos y condiciones que aparecerán en el PDF del presupuesto"
      className="p-6"
    >
      <div className="space-y-6">
        {/* Información general */}
        <div className="p-6 rounded-xl border-2 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/40">
              <FileText className="text-sag-600 dark:text-sag-400" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Información de Garantía
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta póliza de garantía se incluirá automáticamente en el PDF generado. 
                Los términos cubren todas las reparaciones realizadas en SAG Garage con una garantía de 30 días naturales.
              </p>
            </div>
          </div>
        </div>

        {/* Botón para expandir/colapsar términos */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
        >
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {expanded ? 'Ocultar' : 'Ver'} Términos Completos de la Garantía
          </span>
          {expanded ? (
            <ChevronUp className="text-sag-600 dark:text-sag-400" size={24} />
          ) : (
            <ChevronDown className="text-sag-600 dark:text-sag-400" size={24} />
          )}
        </button>

        {/* Términos expandibles */}
        {expanded && (
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2">
            {/* Cobertura */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield size={18} className="text-sag-600 dark:text-sag-400" />
                1. Cobertura de la Garantía
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.cobertura}
              </p>
            </div>

            {/* Lugar */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                2. Lugar de la Garantía
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.lugarGarantia}
              </p>
            </div>

            {/* Exclusiones */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
                3. Exclusiones
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 pl-6 space-y-1">
                {POLIZA_GARANTIA.exclusiones.map((exclusion, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span>{exclusion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsabilidad del Cliente */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                4. Responsabilidad del Cliente
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.responsabilidadCliente}
              </p>
            </div>

            {/* Tiempo de Revisión */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                5. Tiempo de Revisión
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.tiempoRevision}
              </p>
            </div>

            {/* Alcance */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                6. Alcance de la Garantía
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.alcance}
              </p>
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                7. Horarios de Atención
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.horarios}
              </p>
            </div>

            {/* Traslado */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                8. Traslado del Vehículo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.traslado}
              </p>
            </div>

            {/* Responsabilidad Limitada */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                9. Responsabilidad Limitada
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 pl-6 space-y-1">
                {POLIZA_GARANTIA.responsabilidadLimitada.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ajustes */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                10. Ajustes sin Costo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.ajustesSinCosto}
              </p>
            </div>

            {/* Revisión Inmediata */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                11. Revisión Inmediata
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {POLIZA_GARANTIA.revisionInmediata}
              </p>
            </div>

            {/* Aceptación */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                12. Aceptación
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {POLIZA_GARANTIA.aceptacion}
              </p>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Nota:</p>
              <p>
                Esta póliza de garantía es de carácter informativo y será incluida automáticamente 
                en el PDF del presupuesto. No requiere aceptación previa del cliente en el sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
