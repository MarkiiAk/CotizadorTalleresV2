<?php
/**
 * Modelo de Orden de Servicio V2.0 Enterprise
 * Compatible con database schema V2.0
 */

class Orden {
    // Propiedades principales
    public $id;
    public $numero_orden;
    public $cliente_id;
    public $vehiculo_id;
    public $usuario_id;
    public $problema_reportado;
    public $diagnostico;
    public $estado_id;
    public $prioridad;
    public $kilometraje_entrada;
    public $kilometraje_salida;
    public $nivel_combustible;
    public $subtotal;
    public $descuento;
    public $iva_porcentaje;
    public $iva_monto;
    public $total;
    public $anticipo;
    public $fecha_ingreso;
    public $fecha_promesa;
    public $created_at;
    public $updated_at;
    
    // Relaciones
    public $cliente;
    public $vehiculo;
    public $estado;
    public $usuario;
    public $servicios = [];
    public $refacciones = [];
    public $inspeccion = [];
    public $puntos_seguridad = [];
    public $timeline = [];
    
    // Estados válidos
    const ESTADOS = [
        1 => 'Recibido',
        2 => 'En Diagnóstico',
        3 => 'Esperando Autorización',
        4 => 'Autorizado',
        5 => 'En Proceso',
        6 => 'Esperando Refacciones',
        7 => 'En Reparación',
        8 => 'Control de Calidad',
        9 => 'Terminado',
        10 => 'Entregado',
        11 => 'Cancelado'
    ];
    
    // Prioridades válidas
    const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];
    
    /**
     * Constructor
     */
    public function __construct($data = []) {
        if (!empty($data)) {
            $this->hydrate($data);
        }
    }
    
    /**
     * Llenar propiedades desde array
     */
    public function hydrate($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
        
        // Convertir tipos
        $this->id = $this->id ? (int)$this->id : null;
        $this->cliente_id = $this->cliente_id ? (int)$this->cliente_id : null;
        $this->vehiculo_id = $this->vehiculo_id ? (int)$this->vehiculo_id : null;
        $this->usuario_id = $this->usuario_id ? (int)$this->usuario_id : null;
        $this->estado_id = $this->estado_id ? (int)$this->estado_id : 1;
        $this->nivel_combustible = $this->nivel_combustible ? (float)$this->nivel_combustible : 0;
        $this->subtotal = $this->subtotal ? (float)$this->subtotal : 0;
        $this->descuento = $this->descuento ? (float)$this->descuento : 0;
        $this->iva_porcentaje = $this->iva_porcentaje ? (float)$this->iva_porcentaje : 0;
        $this->iva_monto = $this->iva_monto ? (float)$this->iva_monto : 0;
        $this->total = $this->total ? (float)$this->total : 0;
        $this->anticipo = $this->anticipo ? (float)$this->anticipo : 0;
    }
    
    /**
     * Convertir a array
     */
    public function toArray() {
        $data = [];
        foreach (get_object_vars($this) as $key => $value) {
            if (!is_array($value) && !is_object($value)) {
                $data[$key] = $value;
            }
        }
        return $data;
    }
    
    /**
     * Convertir a JSON
     */
    public function toJson() {
        return json_encode($this->toArray());
    }
    
    /**
     * Validar datos de la orden
     */
    public function validate() {
        $errors = [];
        
        // Validar campos obligatorios
        if (empty($this->cliente_id)) {
            $errors['cliente_id'] = 'Cliente requerido';
        }
        
        if (empty($this->vehiculo_id)) {
            $errors['vehiculo_id'] = 'Vehículo requerido';
        }
        
        if (empty($this->usuario_id)) {
            $errors['usuario_id'] = 'Usuario requerido';
        }
        
        if (empty($this->problema_reportado)) {
            $errors['problema_reportado'] = 'Problema reportado requerido';
        }
        
        // Validar estado
        if ($this->estado_id && !array_key_exists($this->estado_id, self::ESTADOS)) {
            $errors['estado_id'] = 'Estado inválido';
        }
        
        // Validar prioridad
        if ($this->prioridad && !in_array($this->prioridad, self::PRIORIDADES)) {
            $errors['prioridad'] = 'Prioridad inválida';
        }
        
        // Validar montos
        if ($this->subtotal < 0) {
            $errors['subtotal'] = 'Subtotal no puede ser negativo';
        }
        
        if ($this->descuento < 0) {
            $errors['descuento'] = 'Descuento no puede ser negativo';
        }
        
        if ($this->total < 0) {
            $errors['total'] = 'Total no puede ser negativo';
        }
        
        if ($this->anticipo < 0) {
            $errors['anticipo'] = 'Anticipo no puede ser negativo';
        }
        
        if ($this->anticipo > $this->total) {
            $errors['anticipo'] = 'Anticipo no puede ser mayor al total';
        }
        
        return $errors;
    }
    
    /**
     * Verificar si la orden es válida
     */
    public function isValid() {
        return empty($this->validate());
    }
    
    /**
     * Obtener nombre del estado
     */
    public function getEstadoNombre() {
        return self::ESTADOS[$this->estado_id] ?? 'Desconocido';
    }
    
    /**
     * Verificar si está en estado específico
     */
    public function isEstado($estado) {
        if (is_string($estado)) {
            return array_search($estado, self::ESTADOS) === $this->estado_id;
        }
        return $this->estado_id === $estado;
    }
    
    /**
     * Verificar si está terminada
     */
    public function isTerminada() {
        return in_array($this->estado_id, [9, 10]); // Terminado, Entregado
    }
    
    /**
     * Verificar si está cancelada
     */
    public function isCancelada() {
        return $this->estado_id === 11;
    }
    
    /**
     * Verificar si está activa
     */
    public function isActiva() {
        return !$this->isTerminada() && !$this->isCancelada();
    }
    
    /**
     * Calcular saldo restante
     */
    public function getSaldoRestante() {
        return $this->total - $this->anticipo;
    }
    
    /**
     * Verificar si está pagada completamente
     */
    public function isPagadaCompleta() {
        return $this->anticipo >= $this->total;
    }
    
    /**
     * Calcular porcentaje de anticipo
     */
    public function getPorcentajeAnticipo() {
        if ($this->total <= 0) return 0;
        return ($this->anticipo / $this->total) * 100;
    }
    
    /**
     * Agregar servicio
     */
    public function addServicio($servicio) {
        $this->servicios[] = $servicio;
    }
    
    /**
     * Agregar refacción
     */
    public function addRefaccion($refaccion) {
        $this->refacciones[] = $refaccion;
    }
    
    /**
     * Obtener días desde ingreso
     */
    public function getDiasDesdeIngreso() {
        if (!$this->fecha_ingreso) return 0;
        $fechaIngreso = new DateTime($this->fecha_ingreso);
        $ahora = new DateTime();
        $diff = $ahora->diff($fechaIngreso);
        return $diff->days;
    }
    
    /**
     * Obtener días hasta promesa
     */
    public function getDiasHastaPromesa() {
        if (!$this->fecha_promesa) return null;
        $fechaPromesa = new DateTime($this->fecha_promesa);
        $ahora = new DateTime();
        $diff = $fechaPromesa->diff($ahora);
        return $fechaPromesa < $ahora ? -$diff->days : $diff->days;
    }
    
    /**
     * Verificar si está atrasada
     */
    public function isAtrasada() {
        if (!$this->fecha_promesa || $this->isTerminada()) return false;
        return new DateTime() > new DateTime($this->fecha_promesa);
    }
    
    /**
     * Obtener prioridad color
     */
    public function getPrioridadColor() {
        $colors = [
            'baja' => '#28a745',
            'media' => '#ffc107',
            'alta' => '#fd7e14',
            'urgente' => '#dc3545'
        ];
        return $colors[$this->prioridad] ?? '#6c757d';
    }
    
    /**
     * Formatear para frontend (compatibilidad)
     */
    public function toFrontendFormat() {
        return [
            'id' => $this->id,
            'numeroOrden' => $this->numero_orden,
            'cliente' => $this->cliente ?? [],
            'vehiculo' => $this->vehiculo ?? [],
            'problemaReportado' => $this->problema_reportado,
            'diagnosticoTecnico' => $this->diagnostico,
            'estado' => [
                'id' => $this->estado_id,
                'nombre' => $this->getEstadoNombre()
            ],
            'prioridad' => $this->prioridad,
            'fechaIngreso' => $this->fecha_ingreso,
            'fechaSalida' => $this->fecha_promesa,
            'servicios' => $this->servicios,
            'manoDeObra' => [], // Se separa en el controlador
            'refacciones' => $this->refacciones,
            'inspeccion' => $this->inspeccion,
            'puntosSeguridad' => $this->puntos_seguridad,
            'resumen' => [
                'subtotal' => $this->subtotal,
                'descuento' => $this->descuento,
                'incluirIVA' => $this->iva_porcentaje > 0,
                'iva' => $this->iva_monto,
                'total' => $this->total,
                'anticipo' => $this->anticipo,
                'restante' => $this->getSaldoRestante()
            ],
            'timeline' => $this->timeline,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
    
    /**
     * Crear desde datos del frontend
     */
    public static function fromFrontendData($data) {
        $orden = new self();
        
        // Mapear campos del frontend
        $orden->problema_reportado = $data['problemaReportado'] ?? '';
        $orden->diagnostico = $data['diagnosticoTecnico'] ?? '';
        $orden->fecha_promesa = isset($data['fechaSalida']) && $data['fechaSalida'] 
            ? date('Y-m-d H:i:s', strtotime($data['fechaSalida'])) 
            : null;
        
        // Datos del vehículo
        if (isset($data['vehiculo'])) {
            $vehiculo = $data['vehiculo'];
            $orden->kilometraje_entrada = $vehiculo['kilometrajeEntrada'] ?? '';
            $orden->kilometraje_salida = $vehiculo['kilometrajeSalida'] ?? '';
            $orden->nivel_combustible = $vehiculo['nivelCombustible'] ?? 0;
        }
        
        // Resumen financiero
        if (isset($data['resumen'])) {
            $resumen = $data['resumen'];
            $orden->subtotal = $resumen['subtotal'] ?? 0;
            $orden->descuento = $resumen['descuento'] ?? 0;
            $orden->iva_porcentaje = ($resumen['incluirIVA'] ?? false) ? 16 : 0;
            $orden->iva_monto = $resumen['iva'] ?? 0;
            $orden->total = $resumen['total'] ?? 0;
            $orden->anticipo = $resumen['anticipo'] ?? 0;
        }
        
        // Datos relacionados
        $orden->servicios = $data['servicios'] ?? [];
        $orden->refacciones = $data['refacciones'] ?? [];
        $orden->inspeccion = $data['inspeccion'] ?? [];
        $orden->puntos_seguridad = $data['puntosSeguridad'] ?? [];
        
        return $orden;
    }
    
    /**
     * Clonar orden (para duplicar)
     */
    public function duplicate() {
        $nueva = clone $this;
        $nueva->id = null;
        $nueva->numero_orden = null;
        $nueva->fecha_ingreso = null;
        $nueva->created_at = null;
        $nueva->updated_at = null;
        $nueva->estado_id = 1; // Recibido
        $nueva->timeline = [];
        
        return $nueva;
    }
    
    /**
     * Obtener resumen para dashboard
     */
    public function getResumenDashboard() {
        return [
            'id' => $this->id,
            'numero_orden' => $this->numero_orden,
            'cliente_nombre' => $this->cliente['nombre'] ?? 'Sin cliente',
            'vehiculo_info' => ($this->vehiculo['marca'] ?? '') . ' ' . ($this->vehiculo['modelo'] ?? ''),
            'estado_nombre' => $this->getEstadoNombre(),
            'total' => $this->total,
            'dias_ingreso' => $this->getDiasDesdeIngreso(),
            'is_atrasada' => $this->isAtrasada(),
            'prioridad' => $this->prioridad,
            'prioridad_color' => $this->getPrioridadColor()
        ];
    }
}