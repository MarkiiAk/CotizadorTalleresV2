/**
 * ⚠️ ARCHIVO DESHABILITADO
 * 
 * Este archivo de localStorage ha sido completamente deshabilitado.
 * TODO debe ir a la base de datos MySQL a través de la API REST.
 * 
 * Si ves este mensaje en consola, significa que algo está intentando
 * usar localStorage cuando NO debería.
 */

console.error('❌ localStorage.ts está DESHABILITADO - usa solo la API REST');

// Exportar funciones vacías para evitar errores
export const saveToLocalStorage = () => {
  throw new Error('❌ localStorage DESHABILITADO - usa API REST');
};

export const loadFromLocalStorage = () => {
  throw new Error('❌ localStorage DESHABILITADO - usa API REST');
};

export const clearLocalStorage = () => {
  console.warn('⚠️ Intentando usar localStorage cuando está deshabilitado');
};