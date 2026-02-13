import { create } from 'zustand';
import { Presupuesto, Servicio, Refaccion, ManoDeObra, ThemeMode, InspeccionVehiculo, PuntoSeguridadOrden } from '../types';

interface PresupuestoState {
  // Estado del presupuesto
  presupuesto: Presupuesto;
  
  // Tema
  themeMode: ThemeMode;
  
  // Estado de guardado
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  
  // Acciones del presupuesto
  updateTaller: (data: Partial<Presupuesto['taller']>) => void;
  updateCliente: (data: Partial<Presupuesto['cliente']>) => void;
  updateVehiculo: (data: Partial<Presupuesto['vehiculo']>) => void;
  
  // Puntos de Seguridad
  updatePuntosSeguridad: (puntos: PuntoSeguridadOrden[]) => void;
  
  // Servicios
  addServicio: (servicio: Omit<Servicio, 'id'>) => void;
  updateServicio: (id: string, servicio: Partial<Servicio>) => void;
  deleteServicio: (id: string) => void;
  
  // Refacciones
  addRefaccion: (refaccion: Omit<Refaccion, 'id' | 'total'>) => void;
  updateRefaccion: (id: string, refaccion: Partial<Refaccion>) => void;
  deleteRefaccion: (id: string) => void;
  
  // Mano de obra
  addManoDeObra: (manoDeObra: Omit<ManoDeObra, 'id'>) => void;
  updateManoDeObra: (id: string, manoDeObra: Partial<ManoDeObra>) => void;
  deleteManoDeObra: (id: string) => void;
  
  // Resumen financiero
  updateAnticipo: (anticipo: number) => void;
  toggleIVA: (incluir: boolean) => void;
  calcularResumen: () => void;
  
  // Tema
  toggleTheme: () => void;
  
  // Control de cambios
  markAsChanged: () => void;
  markAsSaved: () => void;
  
  // Reset
  resetPresupuesto: () => void;
  
  // Cargar presupuesto
  loadPresupuesto: (presupuesto: Presupuesto) => void;
  
  // Cargar desde orden
  loadFromOrden: (orden: any) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const generateFolio = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `SAG-${year}${month}${day}-${random}`;
};

const initialInspeccion: InspeccionVehiculo = {
  exteriores: {
    lucesFrontales: true,
    cuartoLuces: true,
    antena: true,
    espejosLaterales: true,
    cristales: true,
    emblemas: true,
    llantas: true,
    taponRuedas: true,
    moldurasCompletas: true,
    taponGasolina: true,
    limpiadores: true,
  },
  interiores: {
    instrumentoTablero: true,
    calefaccion: true,
    sistemaSonido: true,
    bocinas: true,
    espejoRetrovisor: true,
    cinturones: true,
    botoniaGeneral: true,
    manijas: true,
    tapetes: true,
    vestiduras: true,
    otros: true,
  },
  danosAdicionales: [],
};

const initialPresupuesto: Presupuesto = {
  id: generateId(),
  folio: generateFolio(),
  fecha: new Date(),
  fechaEntrada: new Date(),
  taller: {
    nombre: 'SAG Garage',
    encargado: '',
    telefono: '',
    direccion: '',
  },
  cliente: {
    nombreCompleto: '',
    telefono: '',
    email: '',
    domicilio: '',
  },
  vehiculo: {
    marca: '',
    modelo: '',
    color: '',
    placas: '',
    niv: '',
    kilometrajeEntrada: '',
    kilometrajeSalida: '',
    nivelGasolina: 50,
  },
  inspeccion: initialInspeccion,
  problemaReportado: '',
  diagnosticoTecnico: '',
  servicios: [],
  refacciones: [],
  manoDeObra: [],
  resumen: {
    servicios: 0,
    refacciones: 0,
    manoDeObra: 0,
    subtotal: 0,
    incluirIVA: false,
    iva: 0,
    total: 0,
    anticipo: 0,
    restante: 0,
  },
  puntosSeguridad: [],
};

export const usePresupuestoStore = create<PresupuestoState>()((set, get) => ({
  presupuesto: initialPresupuesto,
  themeMode: 'dark',
  hasUnsavedChanges: false,
  lastSaved: null,

  // Actualizar información del taller
  updateTaller: (data) => {
    set((state) => ({
      presupuesto: {
        ...state.presupuesto,
        taller: { ...state.presupuesto.taller, ...data },
      },
      hasUnsavedChanges: true,
    }));
  },

  // Actualizar información del cliente
  updateCliente: (data) => {
    set((state) => ({
      presupuesto: {
        ...state.presupuesto,
        cliente: { ...state.presupuesto.cliente, ...data },
      },
      hasUnsavedChanges: true,
    }));
  },

  // Actualizar información del vehículo
  updateVehiculo: (data) => {
    set((state) => ({
      presupuesto: {
        ...state.presupuesto,
        vehiculo: { ...state.presupuesto.vehiculo, ...data },
      },
      hasUnsavedChanges: true,
    }));
  },
  
  // Actualizar puntos de seguridad
  updatePuntosSeguridad: (puntos) => {
    set((state) => ({
      presupuesto: {
        ...state.presupuesto,
        puntosSeguridad: puntos,
      },
      hasUnsavedChanges: true,
    }));
  },

  // Agregar servicio
  addServicio: (servicio) => {
    set((state) => {
      const newServicio: Servicio = {
        ...servicio,
        id: generateId(),
      };
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          servicios: [...state.presupuesto.servicios, newServicio],
        },
        hasUnsavedChanges: true,
      };
      // Calcular resumen después de actualizar
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Actualizar servicio
  updateServicio: (id, servicio) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          servicios: state.presupuesto.servicios.map((s) =>
            s.id === id ? { ...s, ...servicio } : s
          ),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Eliminar servicio
  deleteServicio: (id) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          servicios: state.presupuesto.servicios.filter((s) => s.id !== id),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Agregar refacción
  addRefaccion: (refaccion) => {
    set((state) => {
      // Calcular precio de venta con el margen de ganancia (30% por defecto)
      const margenGanancia = refaccion.margenGanancia || 30;
      const precioVenta = refaccion.precioCosto * (1 + margenGanancia / 100);
      const total = refaccion.cantidad * precioVenta;
      
      const newRefaccion: Refaccion = {
        ...refaccion,
        id: generateId(),
        precioVenta,
        margenGanancia,
        total,
      };
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          refacciones: [...state.presupuesto.refacciones, newRefaccion],
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Actualizar refacción
  updateRefaccion: (id, refaccion) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          refacciones: state.presupuesto.refacciones.map((r) => {
            if (r.id === id) {
              const updated = { ...r, ...refaccion };
              
              // Si se actualiza el precio de costo o el margen, recalcular precio de venta
              if (refaccion.precioCosto !== undefined || refaccion.margenGanancia !== undefined) {
                const margenGanancia = updated.margenGanancia || 30;
                updated.precioVenta = updated.precioCosto * (1 + margenGanancia / 100);
              }
              
              // Recalcular total
              updated.total = updated.cantidad * updated.precioVenta;
              return updated;
            }
            return r;
          }),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Eliminar refacción
  deleteRefaccion: (id) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          refacciones: state.presupuesto.refacciones.filter((r) => r.id !== id),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Agregar mano de obra
  addManoDeObra: (manoDeObra) => {
    set((state) => {
      const newManoDeObra: ManoDeObra = {
        ...manoDeObra,
        id: generateId(),
      };
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          manoDeObra: [...state.presupuesto.manoDeObra, newManoDeObra],
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Actualizar mano de obra
  updateManoDeObra: (id, manoDeObra) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          manoDeObra: state.presupuesto.manoDeObra.map((m) =>
            m.id === id ? { ...m, ...manoDeObra } : m
          ),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Eliminar mano de obra
  deleteManoDeObra: (id) => {
    set((state) => {
      const newState = {
        presupuesto: {
          ...state.presupuesto,
          manoDeObra: state.presupuesto.manoDeObra.filter((m) => m.id !== id),
        },
        hasUnsavedChanges: true,
      };
      setTimeout(() => get().calcularResumen(), 0);
      return newState;
    });
  },

  // Actualizar anticipo
  updateAnticipo: (anticipo) => {
    set((state) => {
      const total = state.presupuesto.resumen.incluirIVA 
        ? state.presupuesto.resumen.subtotal * 1.16 
        : state.presupuesto.resumen.subtotal;
      
      return {
        presupuesto: {
          ...state.presupuesto,
          resumen: {
            ...state.presupuesto.resumen,
            anticipo,
            restante: total - anticipo,
          },
        },
        hasUnsavedChanges: true,
      };
    });
  },

  // Toggle IVA
  toggleIVA: (incluir) => {
    set((state) => {
      const subtotal = state.presupuesto.resumen.subtotal;
      const iva = incluir ? subtotal * 0.16 : 0;
      const total = incluir ? subtotal * 1.16 : subtotal;
      const restante = total - state.presupuesto.resumen.anticipo;

      return {
        presupuesto: {
          ...state.presupuesto,
          resumen: {
            ...state.presupuesto.resumen,
            incluirIVA: incluir,
            iva,
            total,
            restante,
          },
        },
        hasUnsavedChanges: true,
      };
    });
  },

  // Calcular resumen financiero
  calcularResumen: () => {
    set((state) => {
      const serviciosTotal = state.presupuesto.servicios.reduce(
        (sum, s) => sum + s.precio,
        0
      );
      const refaccionesTotal = state.presupuesto.refacciones.reduce(
        (sum, r) => sum + r.total,
        0
      );
      const manoDeObraTotal = state.presupuesto.manoDeObra.reduce(
        (sum, m) => sum + m.precio,
        0
      );
      const subtotal = serviciosTotal + refaccionesTotal + manoDeObraTotal;
      const incluirIVA = state.presupuesto.resumen.incluirIVA;
      const iva = incluirIVA ? subtotal * 0.16 : 0;
      const total = incluirIVA ? subtotal * 1.16 : subtotal;
      const restante = total - state.presupuesto.resumen.anticipo;

      return {
        presupuesto: {
          ...state.presupuesto,
          resumen: {
            servicios: serviciosTotal,
            refacciones: refaccionesTotal,
            manoDeObra: manoDeObraTotal,
            subtotal,
            incluirIVA,
            iva,
            total,
            anticipo: state.presupuesto.resumen.anticipo,
            restante,
          },
        },
      };
    });
  },

  // Toggle tema
  toggleTheme: () => {
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    }));
  },

  // Marcar como cambiado
  markAsChanged: () => {
    set({ hasUnsavedChanges: true });
  },

  // Marcar como guardado
  markAsSaved: () => {
    set({ hasUnsavedChanges: false, lastSaved: new Date() });
  },

  // Reset presupuesto
  resetPresupuesto: () => {
    set({
      presupuesto: {
        ...initialPresupuesto,
        id: generateId(),
        folio: generateFolio(),
        fecha: new Date(),
        fechaEntrada: new Date(),
      },
      hasUnsavedChanges: false,
      lastSaved: null,
    });
  },

  // Cargar presupuesto
  loadPresupuesto: (presupuesto) => {
    set({
      presupuesto,
      hasUnsavedChanges: false,
    });
  },
  
  // Cargar desde orden
  loadFromOrden: (orden) => {
    // Convertir formato backend PHP a formato frontend
    const ordenAny = orden as any;
    
    // Si viene del backend PHP (campos planos), convertir a formato frontend
    const cliente = ordenAny.cliente_nombre ? {
      nombreCompleto: ordenAny.cliente_nombre || '',
      telefono: ordenAny.cliente_telefono || '',
      email: ordenAny.cliente_email || '',
      domicilio: ordenAny.cliente_domicilio || '',
    } : orden.cliente;
    
    const vehiculo = ordenAny.marca ? {
      marca: ordenAny.marca || '',
      modelo: ordenAny.modelo || '',
      color: ordenAny.color || '',
      placas: ordenAny.placas || '',
      niv: ordenAny.niv || '',
      kilometrajeEntrada: ordenAny.kilometraje_entrada || '',
      kilometrajeSalida: ordenAny.kilometraje_salida || '',
      nivelGasolina: parseFloat(ordenAny.nivel_combustible || '50'),
    } : orden.vehiculo;
    
    const taller = ordenAny.taller_encargado ? {
      nombre: 'SAG Garage',
      encargado: ordenAny.taller_encargado || '',
      telefono: ordenAny.taller_telefono || '',
      direccion: ordenAny.taller_direccion || '',
    } : orden.taller;
    
    // Si viene el objeto resumen del backend, usarlo directamente
    // De lo contrario, crear un resumen vacío
    const resumen = orden.resumen ? {
      servicios: parseFloat(orden.resumen.servicios || '0'),
      refacciones: parseFloat(orden.resumen.refacciones || '0'),
      manoDeObra: parseFloat(orden.resumen.manoDeObra || '0'),
      subtotal: parseFloat(orden.resumen.subtotal || '0'),
      incluirIVA: Boolean(orden.resumen.incluirIVA),
      iva: parseFloat(orden.resumen.iva || '0'),
      total: parseFloat(orden.resumen.total || '0'),
      anticipo: parseFloat(orden.resumen.anticipo || '0'),
      restante: parseFloat(orden.resumen.restante || '0'),
    } : {
      servicios: 0,
      refacciones: 0,
      manoDeObra: 0,
      subtotal: 0,
      incluirIVA: false,
      iva: 0,
      total: 0,
      anticipo: 0,
      restante: 0,
    };
    
    const folio = ordenAny.numero_orden || orden.folio || '';
    const fechaCreacion = ordenAny.fecha_ingreso || orden.fechaCreacion;
    const fechaSalida = orden.fechaSalida || ordenAny.fecha_promesa_entrega;
    
    set({
      presupuesto: {
        id: orden.id,
        folio: folio,
        fecha: new Date(fechaCreacion),
        fechaEntrada: orden.fechaEntrada ? new Date(orden.fechaEntrada) : new Date(fechaCreacion),
        fechaSalida: fechaSalida ? new Date(fechaSalida) : undefined,
        taller: taller,
        cliente: cliente,
        vehiculo: vehiculo,
        inspeccion: orden.inspeccion || initialInspeccion,
        problemaReportado: ordenAny.problema_reportado || orden.problemaReportado || '',
        diagnosticoTecnico: ordenAny.diagnostico_tecnico || orden.diagnosticoTecnico || '',
        servicios: orden.servicios || [],
        refacciones: orden.refacciones || [],
        manoDeObra: orden.manoDeObra || [],
        resumen: resumen,
        puntosSeguridad: orden.puntosSeguridad || [],
      },
      hasUnsavedChanges: false,
    });
  },
}));
