<?php

/**
 * Modelo Orden - Entidad de dominio
 * Representa una orden de servicio en el sistema
 * 
 * @version 2.0.0
 * @author SAG Garage Team
 */
class Orden {
    private int $id;
    private string $numeroOrden;
    private int $clienteId;
    private int $vehiculoId;
    private int $usuarioId;
    private string $problemaReportado;
    private ?string $diagnostico;
    private int $estadoId;
    private string $prioridad;
    private ?string $kilometrajeEntrada;
    private ?string $kilometrajeSalida;
    private float $nivelCombustible;
    private float $subtotal;
    private float $descuento;
    private float $ivaPorcentaje;
    private float $ivaMonto;
    private float $total;
    private float $anticipo;
    private \DateTime $fechaIngreso;
    private ?\DateTime $fechaPromesa;
    private ?\DateTime $fechaCompletado;
    private ?\DateTime $fechaEntregado;
    
    // Relaciones
    private ?Cliente $cliente = null;
    private ?Vehiculo $vehiculo = null;
    private ?Usuario $usuario = null;
    private ?EstadoOrden $estado = null;
    private array $servicios = [];
    private array $refacciones = [];
    private array $inspeccion = [];
    private array $timeline = [];

    public function __construct(array $data = []) {
        if (!empty($data)) {
            $this->fill($data);
        }
    }

    public function fill(array $data): self {
        $this->id = $data['id'] ?? 0;
        $this->numeroOrden = $data['numero_orden'] ?? '';
        $this->clienteId = $data['cliente_id'] ?? 0;
        $this->vehiculoId = $data['vehiculo_id'] ?? 0;
        $this->usuarioId = $data['usuario_id'] ?? 0;
        $this->problemaReportado = $data['problema_reportado'] ?? '';
        $this->diagnostico = $data['diagnostico'] ?? null;
        $this->estadoId = $data['estado_id'] ?? 1;
        $this->prioridad = $data['prioridad'] ?? 'normal';
        $this->kilometrajeEntrada = $data['kilometraje_entrada'] ?? null;
        $this->kilometrajeSalida = $data['kilometraje_salida'] ?? null;
        $this->nivelCombustible = (float)($data['nivel_combustible'] ?? 0.0);
        $this->subtotal = (float)($data['subtotal'] ?? 0.0);
        $this->descuento = (float)($data['descuento'] ?? 0.0);
        $this->ivaPorcentaje = (float)($data['iva_porcentaje'] ?? 16.0);
        $this->ivaMonto = (float)($data['iva_monto'] ?? 0.0);
        $this->total = (float)($data['total'] ?? 0.0);
        $this->anticipo = (float)($data['anticipo'] ?? 0.0);
        
        $this->fechaIngreso = isset($data['fecha_ingreso']) 
            ? new \DateTime($data['fecha_ingreso']) 
            : new \DateTime();
        
        $this->fechaPromesa = isset($data['fecha_promesa']) 
            ? new \DateTime($data['fecha_promesa']) 
            : null;
            
        $this->fechaCompletado = isset($data['fecha_completado']) 
            ? new \DateTime($data['fecha_completado']) 
            : null;
            
        $this->fechaEntregado = isset($data['fecha_entregado']) 
            ? new \DateTime($data['fecha_entregado']) 
            : null;

        return $this;
    }

    // Getters
    public function getId(): int { return $this->id; }
    public function getNumeroOrden(): string { return $this->numeroOrden; }
    public function getClienteId(): int { return $this->clienteId; }
    public function getVehiculoId(): int { return $this->vehiculoId; }
    public function getUsuarioId(): int { return $this->usuarioId; }
    public function getProblemaReportado(): string { return $this->problemaReportado; }
    public function getDiagnostico(): ?string { return $this->diagnostico; }
    public function getEstadoId(): int { return $this->estadoId; }
    public function getPrioridad(): string { return $this->prioridad; }
    public function getKilometrajeEntrada(): ?string { return $this->kilometrajeEntrada; }
    public function getKilometrajeSalida(): ?string { return $this->kilometrajeSalida; }
    public function getNivelCombustible(): float { return $this->nivelCombustible; }
    public function getSubtotal(): float { return $this->subtotal; }
    public function getDescuento(): float { return $this->descuento; }
    public function getIvaPorcentaje(): float { return $this->ivaPorcentaje; }
    public function getIvaMonto(): float { return $this->ivaMonto; }
    public function getTotal(): float { return $this->total; }
    public function getAnticipo(): float { return $this->anticipo; }
    public function getFechaIngreso(): \DateTime { return $this->fechaIngreso; }
    public function getFechaPromesa(): ?\DateTime { return $this->fechaPromesa; }
    public function getFechaCompletado(): ?\DateTime { return $this->fechaCompletado; }
    public function getFechaEntregado(): ?\DateTime { return $this->fechaEntregado; }

    // Setters
    public function setId(int $id): self { $this->id = $id; return $this; }
    public function setNumeroOrden(string $numeroOrden): self { $this->numeroOrden = $numeroOrden; return $this; }
    public function setClienteId(int $clienteId): self { $this->clienteId = $clienteId; return $this; }
    public function setVehiculoId(int $vehiculoId): self { $this->vehiculoId = $vehiculoId; return $this; }
    public function setUsuarioId(int $usuarioId): self { $this->usuarioId = $usuarioId; return $this; }
    public function setProblemaReportado(string $problema): self { $this->problemaReportado = $problema; return $this; }
    public function setDiagnostico(?string $diagnostico): self { $this->diagnostico = $diagnostico; return $this; }
    public function setEstadoId(int $estadoId): self { $this->estadoId = $estadoId; return $this; }
    public function setPrioridad(string $prioridad): self { $this->prioridad = $prioridad; return $this; }
    public function setKilometrajeEntrada(?string $km): self { $this->kilometrajeEntrada = $km; return $this; }
    public function setKilometrajeSalida(?string $km): self { $this->kilometrajeSalida = $km; return $this; }
    public function setNivelCombustible(float $nivel): self { $this->nivelCombustible = $nivel; return $this; }
    public function setSubtotal(float $subtotal): self { $this->subtotal = $subtotal; return $this; }
    public function setDescuento(float $descuento): self { $this->descuento = $descuento; return $this; }
    public function setIvaPorcentaje(float $iva): self { $this->ivaPorcentaje = $iva; return $this; }
    public function setIvaMonto(float $monto): self { $this->ivaMonto = $monto; return $this; }
    public function setTotal(float $total): self { $this->total = $total; return $this; }
    public function setAnticipo(float $anticipo): self { $this->anticipo = $anticipo; return $this; }
    public function setFechaPromesa(?\DateTime $fecha): self { $this->fechaPromesa = $fecha; return $this; }

    // Relaciones
    public function getCliente(): ?Cliente { return $this->cliente; }
    public function setCliente(?Cliente $cliente): self { $this->cliente = $cliente; return $this; }
    
    public function getVehiculo(): ?Vehiculo { return $this->vehiculo; }
    public function setVehiculo(?Vehiculo $vehiculo): self { $this->vehiculo = $vehiculo; return $this; }
    
    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $usuario): self { $this->usuario = $usuario; return $this; }
    
    public function getEstado(): ?EstadoOrden { return $this->estado; }
    public function setEstado(?EstadoOrden $estado): self { $this->estado = $estado; return $this; }

    public function getServicios(): array { return $this->servicios; }
    public function setServicios(array $servicios): self { $this->servicios = $servicios; return $this; }
    public function addServicio(ServicioOrden $servicio): self { 
        $this->servicios[] = $servicio; 
        return $this; 
    }

    public function getRefacciones(): array { return $this->refacciones; }
    public function setRefacciones(array $refacciones): self { $this->refacciones = $refacciones; return $this; }
    public function addRefaccion(RefaccionOrden $refaccion): self { 
        $this->refacciones[] = $refaccion; 
        return $this; 
    }

    public function getInspeccion(): array { return $this->inspeccion; }
    public function setInspeccion(array $inspeccion): self { $this->inspeccion = $inspeccion; return $this; }

    public function getTimeline(): array { return $this->timeline; }
    public function setTimeline(array $timeline): self { $this->timeline = $timeline; return $this; }

    // Business Logic Methods
    public function calcularSubtotal(): float {
        $subtotal = 0.0;
        
        foreach ($this->servicios as $servicio) {
            $subtotal += $servicio->getSubtotal();
        }
        
        foreach ($this->refacciones as $refaccion) {
            $subtotal += $refaccion->getSubtotal();
        }
        
        return $subtotal - $this->descuento;
    }

    public function calcularIva(): float {
        return ($this->subtotal * $this->ivaPorcentaje) / 100;
    }

    public function calcularTotal(): float {
        return $this->subtotal + $this->ivaMonto;
    }

    public function getSaldo(): float {
        return $this->total - $this->anticipo;
    }

    public function estaCompletada(): bool {
        return $this->estadoId === 9; // Entregado
    }

    public function estaCancelada(): bool {
        return $this->estadoId === 10; // Cancelado
    }

    public function puedeEditarse(): bool {
        return !$this->estaCompletada() && !$this->estaCancelada();
    }

    public function toArray(): array {
        return [
            'id' => $this->id,
            'numero_orden' => $this->numeroOrden,
            'cliente_id' => $this->clienteId,
            'vehiculo_id' => $this->vehiculoId,
            'usuario_id' => $this->usuarioId,
            'problema_reportado' => $this->problemaReportado,
            'diagnostico' => $this->diagnostico,
            'estado_id' => $this->estadoId,
            'prioridad' => $this->prioridad,
            'kilometraje_entrada' => $this->kilometrajeEntrada,
            'kilometraje_salida' => $this->kilometrajeSalida,
            'nivel_combustible' => $this->nivelCombustible,
            'subtotal' => $this->subtotal,
            'descuento' => $this->descuento,
            'iva_porcentaje' => $this->ivaPorcentaje,
            'iva_monto' => $this->ivaMonto,
            'total' => $this->total,
            'anticipo' => $this->anticipo,
            'fecha_ingreso' => $this->fechaIngreso->format('Y-m-d H:i:s'),
            'fecha_promesa' => $this->fechaPromesa ? $this->fechaPromesa->format('Y-m-d H:i:s') : null,
            'fecha_completado' => $this->fechaCompletado ? $this->fechaCompletado->format('Y-m-d H:i:s') : null,
            'fecha_entregado' => $this->fechaEntregado ? $this->fechaEntregado->format('Y-m-d H:i:s') : null,
            'saldo' => $this->getSaldo(),
            'puede_editarse' => $this->puedeEditarse(),
            'esta_completada' => $this->estaCompletada(),
            'esta_cancelada' => $this->estaCancelada(),
        ];
    }

    public function toFrontendFormat(): array {
        $data = $this->toArray();
        
        // Mapear campos específicos para el frontend
        $data['problemaReportado'] = $this->problemaReportado;
        $data['diagnosticoTecnico'] = $this->diagnostico;
        $data['fechaSalida'] = $this->fechaPromesa ? $this->fechaPromesa->format('Y-m-d H:i:s') : null;
        
        // Agregar datos relacionados si están cargados
        if ($this->cliente) {
            $data['cliente_nombre'] = $this->cliente->getNombre();
            $data['cliente_telefono'] = $this->cliente->getTelefono();
            $data['cliente_email'] = $this->cliente->getEmail();
        }
        
        if ($this->vehiculo) {
            $data['vehiculo_marca'] = $this->vehiculo->getMarca();
            $data['vehiculo_modelo'] = $this->vehiculo->getModelo();
            $data['vehiculo_anio'] = $this->vehiculo->getAnio();
            $data['vehiculo_placas'] = $this->vehiculo->getPlacas();
        }
        
        if ($this->estado) {
            $data['estado_nombre'] = $this->estado->getNombre();
            $data['estado_color'] = $this->estado->getColor();
        }
        
        // Agregar resumen financiero
        $data['resumen'] = [
            'subtotal' => $this->subtotal,
            'descuento' => $this->descuento,
            'iva_porcentaje' => $this->ivaPorcentaje,
            'iva_monto' => $this->ivaMonto,
            'total' => $this->total,
            'anticipo' => $this->anticipo,
            'saldo' => $this->getSaldo()
        ];
        
        return $data;
    }
}