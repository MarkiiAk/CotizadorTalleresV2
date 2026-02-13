// Tipos para manejo de errores
export interface APIError {
  message: string;
  errors?: string[];
  field_errors?: Record<string, string[]>;
  status?: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  field_errors?: Record<string, string[]>;
}

// Función para extraer información de error de respuesta de API
export const extractErrorInfo = (error: any): APIError => {
  // Error de red o conexión
  if (!error.response) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      status: 0
    };
  }

  const { status, data } = error.response;
  
  // Si la respuesta tiene el formato esperado del backend
  if (data && typeof data === 'object') {
    return {
      message: data.message || 'Ocurrió un error inesperado',
      errors: data.errors || [],
      field_errors: data.field_errors || {},
      status
    };
  }

  // Errores HTTP estándar
  const statusMessages: Record<number, string> = {
    400: 'Los datos enviados no son válidos',
    401: 'No tienes autorización para realizar esta acción',
    403: 'No tienes permisos para realizar esta acción',
    404: 'El recurso solicitado no fue encontrado',
    422: 'Los datos proporcionados contienen errores',
    500: 'Error interno del servidor. Intenta de nuevo más tarde',
    502: 'Error de servidor. Intenta de nuevo más tarde',
    503: 'El servicio no está disponible temporalmente'
  };

  return {
    message: statusMessages[status] || `Error ${status}`,
    status
  };
};

// Función para formatear errores de campo para mostrar en UI
export const formatFieldErrors = (fieldErrors: Record<string, string[]>): string[] => {
  const formatted: string[] = [];
  
  // Mapeo de nombres técnicos de campos a nombres amigables
  const fieldNames: Record<string, string> = {
    // Cliente
    'cliente.nombre': 'Nombre del cliente',
    'cliente.telefono': 'Teléfono del cliente',
    'cliente.email': 'Email del cliente',
    
    // Vehículo
    'vehiculo.marca': 'Marca del vehículo',
    'vehiculo.modelo': 'Modelo del vehículo',
    'vehiculo.year': 'Año del vehículo',
    'vehiculo.color': 'Color del vehículo',
    'vehiculo.placa': 'Placa del vehículo',
    'vehiculo.vin': 'VIN del vehículo',
    'vehiculo.kilometraje': 'Kilometraje del vehículo',
    'vehiculo.combustible': 'Nivel de combustible',
    
    // Problema
    'problema.descripcion': 'Descripción del problema',
    'problema.sintomas': 'Síntomas reportados',
    
    // Inspección
    'inspeccion.observaciones': 'Observaciones de inspección',
    
    // Servicios
    'servicios': 'Servicios a realizar',
    
    // Refacciones
    'refacciones': 'Refacciones necesarias',
    
    // Mano de obra
    'manoObra': 'Mano de obra',
    
    // Garantía
    'garantia.tipo': 'Tipo de garantía',
    'garantia.duracion': 'Duración de garantía'
  };

  Object.entries(fieldErrors).forEach(([field, errors]) => {
    const fieldName = fieldNames[field] || field;
    errors.forEach(error => {
      formatted.push(`${fieldName}: ${error}`);
    });
  });

  return formatted;
};

// Función para mostrar errores usando el sistema de toasts
export const handleAPIError = (
  error: any,
  showError: (title: string, message?: string, errors?: string[]) => void,
  defaultTitle: string = 'Error'
) => {
  const errorInfo = extractErrorInfo(error);
  const allErrors: string[] = [];

  // Agregar errores generales
  if (errorInfo.errors && errorInfo.errors.length > 0) {
    allErrors.push(...errorInfo.errors);
  }

  // Agregar errores de campo formateados
  if (errorInfo.field_errors && Object.keys(errorInfo.field_errors).length > 0) {
    const fieldErrors = formatFieldErrors(errorInfo.field_errors);
    allErrors.push(...fieldErrors);
  }

  // Mostrar el toast de error
  showError(
    defaultTitle,
    errorInfo.message,
    allErrors.length > 0 ? allErrors : undefined
  );

  // Log para debugging
  console.error('API Error:', {
    originalError: error,
    processedError: errorInfo,
    formattedErrors: allErrors
  });
};