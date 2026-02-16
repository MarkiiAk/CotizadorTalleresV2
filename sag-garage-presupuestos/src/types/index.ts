// Tipos principales del sistema de presupuestos SAG Garage

export interface TallerInfo {
  nombre: string;
  encargado: string;
  telefono: string;
  direccion: string;
  logo?: string;
}

export interface ClienteInfo {
  nombreCompleto: string;
  telefono: string;
  email: string;
  domicilio: string;
}

export interface VehiculoInfo {
  marca: string;
  modelo: string;
  year?: string;
  color: string;
  placas: string;
  niv: string; // Número de Identificación Vehicular (VIN)
  kilometrajeEntrada: string;
  kilometrajeSalida: string;
  nivelGasolina: number; // 0-100 (porcentaje)
}

export interface InspeccionVehiculo {
  exteriores: {
    lucesFrontales: boolean;
    cuartoLuces: boolean;
    antena: boolean;
    espejosLaterales: boolean;
    cristales: boolean;
    emblemas: boolean;
    llantas: boolean;
    taponRuedas: boolean;
    moldurasCompletas: boolean;
    taponGasolina: boolean;
    limpiadores: boolean;
  };
  interiores: {
    instrumentoTablero: boolean;
    calefaccion: boolean;
    sistemaSonido: boolean;
    bocinas: boolean;
    espejoRetrovisor: boolean;
    cinturones: boolean;
    botoniaGeneral: boolean;
    manijas: boolean;
    tapetes: boolean;
    vestiduras: boolean;
    otros: boolean;
  };
  danosAdicionales: DanoVehiculo[];
}

export interface DanoVehiculo {
  id: string;
  ubicacion: string; // ej: "Puerta delantera izquierda"
  tipo: string; // ej: "Rayón", "Golpe", "Abolladura"
  descripcion: string;
}

export interface Servicio {
  id: string;
  descripcion: string;
  precio: number;
}

export interface Refaccion {
  id: string;
  nombre: string;
  cantidad: number;
  precioCosto: number; // Precio de costo (lo que paga el taller)
  precioVenta: number; // Precio de venta (con 30% de ganancia)
  margenGanancia: number; // Porcentaje de ganancia (ej: 30)
  total: number; // cantidad * precioVenta
}

export interface ManoDeObra {
  id: string;
  descripcion: string;
  precio: number;
}

export interface ResumenFinanciero {
  servicios: number;
  refacciones: number;
  manoDeObra: number;
  subtotal: number;
  incluirIVA: boolean;
  iva: number;
  total: number;
  anticipo: number;
  restante: number;
}

export interface Presupuesto {
  id: string;
  folio: string;
  fecha: Date;
  fechaEntrada: Date;
  fechaSalida?: Date;
  taller: TallerInfo;
  cliente: ClienteInfo;
  vehiculo: VehiculoInfo;
  inspeccion: InspeccionVehiculo;
  problemaReportado: string;
  diagnosticoTecnico: string;
  servicios: Servicio[];
  refacciones: Refaccion[];
  manoDeObra: ManoDeObra[];
  resumen: ResumenFinanciero;
  puntosSeguridad?: PuntoSeguridadOrden[];
}

export interface PolizaGarantia {
  cobertura: string;
  lugarGarantia: string;
  exclusiones: string[];
  responsabilidadCliente: string;
  tiempoRevision: string;
  alcance: string;
  horarios: string;
  traslado: string;
  responsabilidadLimitada: string[];
  ajustesSinCosto: string;
  revisionInmediata: string;
  aceptacion: string;
}

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  presupuesto: Presupuesto;
  themeMode: ThemeMode;
  autoSave: boolean;
  lastSaved: Date | null;
}

// Tipos para el sistema de gestión de órdenes

// Nuevos tipos para Puntos de Seguridad

export interface EstadoSeguridad {
  id: number;
  nombre: string;
  color: string;
  icono: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface PuntoSeguridadCatalogo {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  ubicacion: string;
  orden: number;
  activo: boolean;
}

export interface PuntoSeguridadOrden {
  id: number;
  ordenId: number;
  puntoId: number;
  estadoId: number;
  observaciones: string;
  fotoUrl?: string;
  fechaRevision: string;
  revisadoPor?: string;
  punto?: PuntoSeguridadCatalogo;
  estado?: EstadoSeguridad;
}

export interface Orden {
  id: string;
  folio: string;
  estado: 'abierta' | 'cerrada' | 'pendiente'; // 'pendiente' para compatibilidad con datos antiguos
  estado_id?: number; // ID del estado de la orden (viene del backend PHP)
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre?: string;
  creadoPor?: string;
  modificadoPor?: string;
  taller: TallerInfo;
  cliente: ClienteInfo;
  vehiculo: VehiculoInfo;
  inspeccion: InspeccionVehiculo;
  problemaReportado: string;
  diagnosticoTecnico: string;
  servicios: Servicio[];
  refacciones: Refaccion[];
  manoDeObra: ManoDeObra[];
  resumen: ResumenFinanciero;
  puntosSeguridad?: PuntoSeguridadOrden[];
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rol: 'admin' | 'mecanico' | 'recepcionista';
}

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ElementoInspeccion {
  id: number;
  nombre: string;
  key: string;
  orden: number;
}
