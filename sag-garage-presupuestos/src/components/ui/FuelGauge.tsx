import React from 'react';
import { Fuel } from 'lucide-react';

interface FuelGaugeProps {
  level: number; // 0-100
  onChange: (level: number) => void;
  label?: string;
  disabled?: boolean;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({ level, onChange, label = 'Nivel de Gasolina', disabled = false }) => {
  const getFuelColor = () => {
    if (level <= 25) return '#ef4444'; // red
    if (level <= 50) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const getFuelLabel = () => {
    if (level === 0) return 'Vacío';
    if (level <= 25) return 'Bajo';
    if (level <= 50) return 'Medio';
    if (level <= 75) return '3/4';
    if (level < 100) return 'Casi lleno';
    return 'Lleno';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="relative">
        {/* Gauge estilo tablero de auto - solo arco */}
        <div className="relative w-full max-w-xs mx-auto">
          <svg viewBox="0 0 200 120" className="w-full">
            {/* Fondo del gauge - arco gris */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              className="text-gray-200 dark:text-gray-700"
              strokeLinecap="round"
            />
            
            {/* Arco de color según nivel - se llena progresivamente */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getFuelColor()}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(level * 251.2) / 100} 251.2`}
              className="transition-all duration-500"
            />
            
            {/* Ícono de gasolina en el centro */}
            <g transform="translate(90, 75)">
              <Fuel size={24} className="text-gray-500 dark:text-gray-400" />
            </g>
          </svg>
          
          {/* Display digital del porcentaje */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
            <div className="bg-gray-900 dark:bg-gray-100 px-4 py-1.5 rounded-md shadow-lg border-2 border-gray-700 dark:border-gray-300">
              <div className="text-lg font-bold text-white dark:text-gray-900 tabular-nums">
                {level}%
              </div>
            </div>
          </div>
          
          {/* Etiqueta de estado debajo del gauge */}
          <div className="text-center mt-16">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {getFuelLabel()}
            </span>
          </div>
        </div>
        
        {/* Slider control */}
        <div className="mt-8">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={level}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Quick buttons */}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onChange(0)}
              disabled={disabled}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vacío
            </button>
            <button
              type="button"
              onClick={() => onChange(25)}
              disabled={disabled}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              1/4
            </button>
            <button
              type="button"
              onClick={() => onChange(50)}
              disabled={disabled}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              1/2
            </button>
            <button
              type="button"
              onClick={() => onChange(75)}
              disabled={disabled}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              3/4
            </button>
            <button
              type="button"
              onClick={() => onChange(100)}
              disabled={disabled}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lleno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
