<?php

require_once __DIR__ . '/../models/Orden.php';

/**
 * Repository de Órdenes - Data Access Layer ENTERPRISE
 * Implementa patrón Repository usando EXCLUSIVAMENTE Stored Procedures
 * ZERO HARDCODED QUERIES - Máxima seguridad y rendimiento
 * 
 * @version 2.0.0 Enterprise
 * @author SAG Garage Team
 */
class OrdenRepository {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Buscar orden por ID con todas sus relaciones
     */
    public function findById(int $id): ?Orden {
        $stmt = $this->db->prepare('CALL sp_orden_find_by_id(?)');
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $orden = new Orden($data);
        
        // Cargar relaciones usando stored procedures
        $this->loadRelaciones($orden);
        
        return $orden;
    }

    /**
     * Buscar orden por número de orden
     */
    public function findByNumeroOrden(string $numeroOrden): ?Orden {
        $stmt = $this->db->prepare('CALL sp_orden_find_by_numero(?)');
        $stmt->execute([$numeroOrden]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        $orden = new Orden($data);
        $this->loadRelaciones($orden);
        
        return $orden;
    }

    /**
     * Obtener todas las órdenes con paginación y filtros
     */
    public function findAll(array $filters = [], int $page = 1, int $limit = 50): array {
        $stmt = $this->db->prepare('CALL sp_ordenes_list_paginated(?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $filters['estado_id'] ?? null,
            $filters['prioridad'] ?? null,
            $filters['fecha_desde'] ?? null,
            $filters['fecha_hasta'] ?? null,
            $filters['cliente_nombre'] ?? null,
            $filters['vehiculo_placas'] ?? null,
            $page,
            $limit
        ]);
        
        $ordenes = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ordenes[] = new Orden($row);
        }

        return $ordenes;
    }

    /**
     * Contar total de órdenes con filtros
     */
    public function count(array $filters = []): int {
        $stmt = $this->db->prepare('CALL sp_ordenes_count_filtered(?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $filters['estado_id'] ?? null,
            $filters['prioridad'] ?? null,
            $filters['fecha_desde'] ?? null,
            $filters['fecha_hasta'] ?? null,
            $filters['cliente_nombre'] ?? null,
            $filters['vehiculo_placas'] ?? null
        ]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total_records'];
    }

    /**
     * Crear nueva orden
     */
    public function create(Orden $orden): int {
        $stmt = $this->db->prepare('CALL sp_orden_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @orden_id)');
        $stmt->execute([
            $orden->getNumeroOrden(),
            $orden->getClienteId(),
            $orden->getVehiculoId(),
            $orden->getUsuarioId(),
            $orden->getProblemaReportado(),
            $orden->getDiagnostico(),
            $orden->getEstadoId(),
            $orden->getPrioridad(),
            $orden->getKilometrajeEntrada(),
            $orden->getKilometrajeSalida(),
            $orden->getNivelCombustible(),
            $orden->getSubtotal(),
            $orden->getDescuento(),
            $orden->getIvaPorcentaje(),
            $orden->getIvaMonto(),
            $orden->getTotal(),
            $orden->getAnticipo(),
            $orden->getFechaPromesa() ? $orden->getFechaPromesa()->format('Y-m-d H:i:s') : null
        ]);

        // Obtener el ID generado
        $result = $this->db->query('SELECT @orden_id AS orden_id')->fetch(PDO::FETCH_ASSOC);
        return (int)$result['orden_id'];
    }

    /**
     * Actualizar orden existente
     */
    public function update(Orden $orden): bool {
        $stmt = $this->db->prepare('CALL sp_orden_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        return $stmt->execute([
            $orden->getId(),
            $orden->getNumeroOrden(),
            $orden->getClienteId(),
            $orden->getVehiculoId(),
            $orden->getUsuarioId(),
            $orden->getProblemaReportado(),
            $orden->getDiagnostico(),
            $orden->getEstadoId(),
            $orden->getPrioridad(),
            $orden->getKilometrajeEntrada(),
            $orden->getKilometrajeSalida(),
            $orden->getNivelCombustible(),
            $orden->getSubtotal(),
            $orden->getDescuento(),
            $orden->getIvaPorcentaje(),
            $orden->getIvaMonto(),
            $orden->getTotal(),
            $orden->getAnticipo(),
            $orden->getFechaPromesa() ? $orden->getFechaPromesa()->format('Y-m-d H:i:s') : null
        ]);
    }

    /**
     * Eliminar orden (implementar stored procedure si es necesario)
     */
    public function delete(int $id): bool {
        // TODO: Crear sp_orden_delete si se requiere funcionalidad de eliminación
        throw new Exception('Eliminación de órdenes no implementada por seguridad');
    }

    /**
     * Cambiar estado de la orden y registrar en timeline
     */
    public function cambiarEstado(int $ordenId, int $nuevoEstadoId, int $usuarioId, ?string $notas = null): bool {
        $stmt = $this->db->prepare('CALL sp_orden_change_status(?, ?, ?, ?)');
        return $stmt->execute([$ordenId, $nuevoEstadoId, $usuarioId, $notas]);
    }

    /**
     * Obtener estadísticas del dashboard
     */
    public function getStats(array $filters = []): array {
        $stmt = $this->db->prepare('CALL sp_dashboard_stats(?, ?)');
        $stmt->execute([
            $filters['fecha_desde'] ?? null,
            $filters['fecha_hasta'] ?? null
        ]);
        
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convertir valores numéricos
        return [
            'total_ordenes' => (int)$stats['total_ordenes'],
            'ordenes_activas' => (int)$stats['ordenes_activas'],
            'ordenes_completadas' => (int)$stats['ordenes_completadas'],
            'ordenes_canceladas' => (int)$stats['ordenes_canceladas'],
            'ordenes_hoy' => (int)$stats['ordenes_hoy'],
            'ticket_promedio' => (float)$stats['ticket_promedio'],
            'ingresos_totales' => (float)$stats['ingresos_totales'],
            'anticipos_recibidos' => (float)$stats['anticipos_recibidos'],
            'saldo_pendiente' => (float)$stats['saldo_pendiente']
        ];
    }

    /**
     * Buscar órdenes por texto libre (número, cliente, placas, etc.)
     */
    public function search(string $query, int $limit = 20): array {
        $stmt = $this->db->prepare('CALL sp_ordenes_search(?, ?)');
        $stmt->execute([$query, $limit]);
        
        $ordenes = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ordenes[] = new Orden($row);
        }

        return $ordenes;
    }

    /**
     * Generar número de orden único
     */
    public function generateNumeroOrden(): string {
        $stmt = $this->db->prepare('CALL sp_generate_numero_orden(@numero_orden)');
        $stmt->execute();
        
        $result = $this->db->query('SELECT @numero_orden AS numero_orden')->fetch(PDO::FETCH_ASSOC);
        return $result['numero_orden'];
    }

    /**
     * Cargar relaciones de la orden (servicios, refacciones, inspección, etc.)
     */
    private function loadRelaciones(Orden $orden): void {
        $this->loadServicios($orden);
        $this->loadRefacciones($orden);
        $this->loadInspeccion($orden);
        $this->loadTimeline($orden);
    }

    /**
     * Cargar servicios de la orden
     */
    private function loadServicios(Orden $orden): void {
        $stmt = $this->db->prepare('CALL sp_orden_get_servicios(?)');
        $stmt->execute([$orden->getId()]);
        
        $servicios = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $servicios[] = $row; // Se podría crear una clase ServicioOrden
        }
        
        $orden->setServicios($servicios);
    }

    /**
     * Cargar refacciones de la orden
     */
    private function loadRefacciones(Orden $orden): void {
        $stmt = $this->db->prepare('CALL sp_orden_get_refacciones(?)');
        $stmt->execute([$orden->getId()]);
        
        $refacciones = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $refacciones[] = $row; // Se podría crear una clase RefaccionOrden
        }
        
        $orden->setRefacciones($refacciones);
    }

    /**
     * Cargar inspección de la orden
     */
    private function loadInspeccion(Orden $orden): void {
        $stmt = $this->db->prepare('CALL sp_orden_get_inspeccion(?)');
        $stmt->execute([$orden->getId()]);
        
        $inspeccion = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $inspeccion[] = $row;
        }
        
        $orden->setInspeccion($inspeccion);
    }

    /**
     * Cargar timeline de la orden
     */
    private function loadTimeline(Orden $orden): void {
        $stmt = $this->db->prepare('CALL sp_orden_get_timeline(?)');
        $stmt->execute([$orden->getId()]);
        
        $timeline = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $timeline[] = $row;
        }
        
        $orden->setTimeline($timeline);
    }
}