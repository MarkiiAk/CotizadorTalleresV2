<?php
/**
 * Repository para manejo de órdenes de servicio V2.0 Enterprise
 * Implementa patrón Repository usando stored procedures
 */

class OrdenRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Buscar orden por ID usando stored procedure
     */
    public function findById($id) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_find_by_id(?)');
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::findById: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Buscar orden por número usando stored procedure
     */
    public function findByNumero($numeroOrden) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_find_by_numero(?)');
            $stmt->execute([$numeroOrden]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::findByNumero: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Listar órdenes con paginación y filtros
     */
    public function listPaginated($filters = [], $page = 1, $limit = 50) {
        try {
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
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::listPaginated: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Contar órdenes con filtros
     */
    public function countFiltered($filters = []) {
        try {
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
            return $result['total_records'] ?? 0;
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::countFiltered: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Crear nueva orden usando stored procedure
     */
    public function create($ordenData) {
        try {
            // Generar número de orden
            $numeroOrden = $this->generateNumeroOrden();
            
            $stmt = $this->db->prepare('
                CALL sp_orden_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @orden_id)
            ');
            
            $stmt->execute([
                $numeroOrden,
                $ordenData['cliente_id'],
                $ordenData['vehiculo_id'],
                $ordenData['usuario_id'],
                $ordenData['problema_reportado'] ?? '',
                $ordenData['diagnostico'] ?? '',
                $ordenData['estado_id'] ?? 1,
                $ordenData['prioridad'] ?? 'media',
                $ordenData['kilometraje_entrada'] ?? '',
                $ordenData['kilometraje_salida'] ?? '',
                $ordenData['nivel_combustible'] ?? 0,
                $ordenData['subtotal'] ?? 0,
                $ordenData['descuento'] ?? 0,
                $ordenData['iva_porcentaje'] ?? 0,
                $ordenData['iva_monto'] ?? 0,
                $ordenData['total'] ?? 0,
                $ordenData['anticipo'] ?? 0,
                $ordenData['fecha_promesa'] ?? null
            ]);
            
            // Obtener ID de la orden creada
            $stmt = $this->db->prepare('SELECT @orden_id as orden_id');
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['orden_id'] ?? null;
            
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::create: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Actualizar orden usando stored procedure
     */
    public function update($id, $ordenData) {
        try {
            $stmt = $this->db->prepare('
                CALL sp_orden_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            
            return $stmt->execute([
                $id,
                $ordenData['numero_orden'],
                $ordenData['cliente_id'],
                $ordenData['vehiculo_id'],
                $ordenData['usuario_id'],
                $ordenData['problema_reportado'] ?? '',
                $ordenData['diagnostico'] ?? '',
                $ordenData['estado_id'] ?? 1,
                $ordenData['prioridad'] ?? 'media',
                $ordenData['kilometraje_entrada'] ?? '',
                $ordenData['kilometraje_salida'] ?? '',
                $ordenData['nivel_combustible'] ?? 0,
                $ordenData['subtotal'] ?? 0,
                $ordenData['descuento'] ?? 0,
                $ordenData['iva_porcentaje'] ?? 0,
                $ordenData['iva_monto'] ?? 0,
                $ordenData['total'] ?? 0,
                $ordenData['anticipo'] ?? 0,
                $ordenData['fecha_promesa'] ?? null
            ]);
            
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::update: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Cambiar estado de orden con timeline
     */
    public function changeStatus($id, $nuevoEstadoId, $usuarioId, $notas = '') {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_change_status(?, ?, ?, ?)');
            return $stmt->execute([$id, $nuevoEstadoId, $usuarioId, $notas]);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::changeStatus: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Eliminar orden
     */
    public function delete($id) {
        try {
            $stmt = $this->db->prepare('DELETE FROM ordenes_servicio WHERE id = ?');
            $stmt->execute([$id]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::delete: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Búsqueda de texto libre
     */
    public function search($query, $limit = 50) {
        try {
            $stmt = $this->db->prepare('CALL sp_ordenes_search(?, ?)');
            $stmt->execute([$query, $limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::search: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener estadísticas para dashboard
     */
    public function getDashboardStats($fechaDesde = null, $fechaHasta = null) {
        try {
            $stmt = $this->db->prepare('CALL sp_dashboard_stats(?, ?)');
            $stmt->execute([$fechaDesde, $fechaHasta]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getDashboardStats: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Obtener servicios de una orden
     */
    public function getServicios($ordenId) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_get_servicios(?)');
            $stmt->execute([$ordenId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getServicios: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener refacciones de una orden
     */
    public function getRefacciones($ordenId) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_get_refacciones(?)');
            $stmt->execute([$ordenId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getRefacciones: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener inspección de una orden
     */
    public function getInspeccion($ordenId) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_get_inspeccion(?)');
            $stmt->execute([$ordenId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getInspeccion: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener timeline de una orden
     */
    public function getTimeline($ordenId) {
        try {
            $stmt = $this->db->prepare('CALL sp_orden_get_timeline(?)');
            $stmt->execute([$ordenId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getTimeline: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Generar número de orden único
     */
    public function generateNumeroOrden() {
        try {
            $stmt = $this->db->prepare('CALL sp_generate_numero_orden(@numero_orden)');
            $stmt->execute();
            
            $stmt = $this->db->prepare('SELECT @numero_orden as numero_orden');
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['numero_orden'] ?? 'OS-' . date('Y') . '-' . time();
            
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::generateNumeroOrden: ' . $e->getMessage());
            return 'OS-' . date('Y') . '-' . time();
        }
    }
    
    /**
     * Obtener órdenes por estado
     */
    public function getByEstado($estadoId) {
        try {
            $filters = ['estado_id' => $estadoId];
            return $this->listPaginated($filters, 1, 1000);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getByEstado: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener órdenes por fecha
     */
    public function getByFecha($fechaDesde, $fechaHasta) {
        try {
            $filters = [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta
            ];
            return $this->listPaginated($filters, 1, 1000);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getByFecha: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener órdenes por cliente
     */
    public function getByCliente($clienteNombre) {
        try {
            $filters = ['cliente_nombre' => $clienteNombre];
            return $this->listPaginated($filters, 1, 1000);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getByCliente: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener órdenes por vehículo (placas)
     */
    public function getByVehiculo($vehiculoPlacas) {
        try {
            $filters = ['vehiculo_placas' => $vehiculoPlacas];
            return $this->listPaginated($filters, 1, 1000);
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::getByVehiculo: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Verificar si existe una orden
     */
    public function exists($id) {
        try {
            $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM ordenes_servicio WHERE id = ?');
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return ($result['count'] ?? 0) > 0;
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::exists: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener el último ID insertado
     */
    public function getLastInsertId() {
        return $this->db->lastInsertId();
    }
    
    /**
     * Iniciar transacción
     */
    public function beginTransaction() {
        return $this->db->beginTransaction();
    }
    
    /**
     * Confirmar transacción
     */
    public function commit() {
        return $this->db->commit();
    }
    
    /**
     * Cancelar transacción
     */
    public function rollback() {
        return $this->db->rollback();
    }
    
    /**
     * Ejecutar query personalizado (para casos especiales)
     */
    public function executeQuery($sql, $params = []) {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (Exception $e) {
            error_log('Error en OrdenRepository::executeQuery: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Obtener conexión a la base de datos (para casos especiales)
     */
    public function getConnection() {
        return $this->db;
    }
}