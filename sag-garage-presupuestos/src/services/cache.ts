/**
 * Servicio de cache inteligente para elementos de inspección
 * Maneja automáticamente la validación, expiración y recarga de datos
 */

import { elementosInspeccionAPI } from './api';

const CACHE_KEYS = {
  ELEMENTOS_INSPECCION: 'elementos-inspeccion-cache'
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

class CacheService {
  private static instance: CacheService;

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Verifica si una entrada de cache es válida
   */
  private isValidCache<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < CACHE_DURATION;
  }

  /**
   * Obtiene datos del cache
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      if (this.isValidCache(entry)) {
        console.log('📦 Cache HIT para', key, '- datos válidos por', Math.round((CACHE_DURATION - (Date.now() - entry.timestamp)) / 1000), 'segundos más');
        return entry.data;
      } else {
        console.log('⏰ Cache EXPIRED para', key, '- eliminando entrada antigua');
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('❌ Error al leer cache:', error);
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Guarda datos en el cache
   */
  private saveToCache<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(key, JSON.stringify(entry));
      console.log('💾 Datos guardados en cache para', key);
    } catch (error) {
      console.error('❌ Error al guardar en cache:', error);
    }
  }

  /**
   * Obtiene elementos de inspección con cache inteligente
   */
  public async getElementosInspeccion(): Promise<any[]> {
    const cacheKey = CACHE_KEYS.ELEMENTOS_INSPECCION;
    
    // Intentar obtener del cache primero
    const cachedData = this.getFromCache<any[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    try {
      console.log('🌐 Cache MISS - obteniendo elementos de inspección desde API...');
      const data = await elementosInspeccionAPI.getElementos();
      
      if (data && Array.isArray(data)) {
        this.saveToCache(cacheKey, data);
        return data;
      } else {
        console.warn('⚠️ API devolvió datos inválidos para elementos de inspección');
        return [];
      }
    } catch (error) {
      console.error('❌ Error al obtener elementos de inspección:', error);
      
      // En caso de error, intentar usar cache expirado como fallback
      try {
        const fallbackCache = localStorage.getItem(cacheKey);
        if (fallbackCache) {
          const entry: CacheEntry<any[]> = JSON.parse(fallbackCache);
          console.log('🔄 Usando cache expirado como fallback');
          return entry.data || [];
        }
      } catch (fallbackError) {
        console.error('❌ Error al usar cache de fallback:', fallbackError);
      }
      
      return [];
    }
  }

  /**
   * Invalida el cache de elementos de inspección
   */
  public invalidateElementosInspeccion(): void {
    localStorage.removeItem(CACHE_KEYS.ELEMENTOS_INSPECCION);
    console.log('🗑️ Cache de elementos de inspección invalidado');
  }

  /**
   * Limpia todo el cache
   */
  public clearAll(): void {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🧹 Todo el cache ha sido limpiado');
  }

  /**
   * Obtiene información del estado del cache
   */
  public getCacheInfo(): { [key: string]: { exists: boolean; age?: number; valid?: boolean } } {
    const info: { [key: string]: { exists: boolean; age?: number; valid?: boolean } } = {};
    
    Object.entries(CACHE_KEYS).forEach(([name, key]) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached);
          const age = Date.now() - entry.timestamp;
          info[name] = {
            exists: true,
            age: Math.round(age / 1000), // en segundos
            valid: this.isValidCache(entry)
          };
        } else {
          info[name] = { exists: false };
        }
      } catch (error) {
        info[name] = { exists: false };
      }
    });
    
    return info;
  }
}

// Exportar instancia singleton
export const cacheService = CacheService.getInstance();

// Exportar para debugging en desarrollo
if (import.meta.env.DEV) {
  (window as any).cacheService = cacheService;
  console.log('🔧 Cache service disponible en window.cacheService para debugging');
}