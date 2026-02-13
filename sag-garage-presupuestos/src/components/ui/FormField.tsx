import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  email?: boolean;
  phone?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
}

export interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule;
  showSuccess?: boolean;
  className?: string;
  rows?: number;
  errorMessage?: string; // Error externo del backend
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  validation,
  showSuccess = true,
  className = '',
  rows = 3,
  errorMessage: externalError
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Función de validación
  const validateValue = (val: string): string | null => {
    if (!validation) return null;

    // Campo requerido
    if (validation.required && (!val || val.trim() === '')) {
      return `${label || name} es obligatorio`;
    }

    // Si está vacío y no es requerido, es válido
    if (!val || val.trim() === '') {
      return null;
    }

    // Longitud mínima
    if (validation.minLength && val.length < validation.minLength) {
      return `${label || name} debe tener al menos ${validation.minLength} caracteres`;
    }

    // Longitud máxima
    if (validation.maxLength && val.length > validation.maxLength) {
      return `${label || name} no puede tener más de ${validation.maxLength} caracteres`;
    }

    // Email
    if (validation.email || type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return 'Introduce un email válido';
      }
    }

    // Teléfono
    if (validation.phone || type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(val) || val.length < 10) {
        return 'Introduce un teléfono válido';
      }
    }

    // Número
    if (validation.number || type === 'number') {
      const num = parseFloat(val);
      if (isNaN(num)) {
        return 'Introduce un número válido';
      }
      if (validation.min !== undefined && num < validation.min) {
        return `El valor debe ser mayor o igual a ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `El valor debe ser menor o igual a ${validation.max}`;
      }
    }

    // Patrón personalizado
    if (validation.pattern && !validation.pattern.test(val)) {
      return `${label || name} tiene un formato incorrecto`;
    }

    // Validación personalizada
    if (validation.custom) {
      return validation.custom(val);
    }

    return null;
  };

  // Validar cuando cambia el valor
  useEffect(() => {
    if (touched) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        const validationError = validateValue(value);
        setError(validationError);
        setIsValidating(false);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    }
  }, [value, touched, validation, label, name, type]);

  // Limpiar error interno cuando hay error externo
  useEffect(() => {
    if (externalError) {
      setError(null);
    }
  }, [externalError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  // Determinar el estado visual
  const hasError = error || externalError;
  const isValid = touched && !hasError && !isValidating && value.trim() !== '';
  const showValidation = touched || externalError;

  // Clases CSS dinámicas
  const inputClasses = `
    input
    ${hasError && showValidation ? 'input-error border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${isValid && showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
    ${isValidating ? 'border-yellow-400' : ''}
    ${className}
  `.trim();


  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className={`label ${required ? 'label-required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
            aria-invalid={hasError && showValidation ? true : undefined}
            aria-describedby={hasError && showValidation ? `${name}-error` : undefined}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClasses}
            aria-invalid={hasError && showValidation ? true : undefined}
            aria-describedby={hasError && showValidation ? `${name}-error` : undefined}
          />
        )}
        
        {/* Indicador visual de estado */}
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating && (
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!isValidating && hasError && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {!isValidating && isValid && showSuccess && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {showValidation && hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {externalError || error}
        </p>
      )}
      
      {/* Mensaje de éxito opcional - REMOVIDO */}
    </div>
  );
};

// Hook para validación de formularios
export const useFormValidation = (initialValues: Record<string, string>, validationRules: Record<string, ValidationRule>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Marcar como tocado
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }

    // Validar campo
    const rule = validationRules[field];
    if (rule) {
      const error = validateField(field, value, rule);
      setErrors(prev => ({ ...prev, [field]: error || '' }));
    }
  };

  const validateField = (field: string, value: string, rule: ValidationRule): string | null => {
    // Reutilizar lógica de validación del componente
    if (rule.required && (!value || value.trim() === '')) {
      return `${field} es obligatorio`;
    }

    if (!value || value.trim() === '') {
      return null;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${field} debe tener al menos ${rule.minLength} caracteres`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${field} no puede tener más de ${rule.maxLength} caracteres`;
    }

    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email inválido';
      }
    }

    if (rule.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value) || value.length < 10) {
        return 'Teléfono inválido';
      }
    }

    if (rule.number) {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Debe ser un número';
      }
      if (rule.min !== undefined && num < rule.min) {
        return `Debe ser mayor o igual a ${rule.min}`;
      }
      if (rule.max !== undefined && num > rule.max) {
        return `Debe ser menor o igual a ${rule.max}`;
      }
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `${field} tiene formato incorrecto`;
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(validationRules).forEach(([field, rule]) => {
      const error = validateField(field, values[field] || '', rule);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const setExternalErrors = (externalErrors: Record<string, string[]>) => {
    const formattedErrors: Record<string, string> = {};
    Object.entries(externalErrors).forEach(([field, errorArray]) => {
      formattedErrors[field] = errorArray[0]; // Tomar el primer error
    });
    setErrors(formattedErrors);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    validateAll,
    setExternalErrors,
    isValid: Object.values(errors).every(error => !error)
  };
};