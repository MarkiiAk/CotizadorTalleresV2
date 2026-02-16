<?php
/**
 * Controlador de órdenes de servicio V2.0 Enterprise
 * Compatible con database schema V2.0 y stored procedures
 */

class OrdenesController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Obtener todas las órdenes - GET /api/ordenes
     */
    public function getAll() {
        try {
            requireAuth();
            
            // Usar stored procedure para listado paginado
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            $estado_id = $_GET['estado_id'] ?? null;
            $prioridad = $_GET['prioridad'] ?? null;
            $fecha_desde = $_GET['fecha_desde'] ?? null;
            $fecha_hasta = $_GET['fecha_hasta'] ?? null;
            $cliente_nombre = $_GET['cliente_nombre'] ?? null;
            $vehiculo_placas = $_GET['vehiculo_placas'] ?? null;
            
            $stmt = $this->db->prepare('CALL sp_ordenes_list_paginated(?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $estado_id,
                $prioridad, 
                $fecha_desde,
                $fecha_hasta,
                $cliente_nombre,
                $vehiculo_placas,
                $page,
                $limit
            ]);
            
            $ordenes = $stmt->fetchAll();
            
            // Procesar cada orden para incluir datos relacionados
            foreach ($ordenes as &$orden) {
                $orden = $this->enrichOrdenData($orden);
            }
            
            echo json_encode($ordenes);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener órdenes',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Obtener una orden por ID - GET /api/ordenes/:id
     */
    public function getById($id) {
        try {
            requireAuth();
            
            $stmt = $this->db->prepare('CALL sp_orden_find_by_id(?)');
            $stmt->execute([$id]);
            $orden = $stmt->fetch();
            
            if (!$orden) {
                http_response_code(404);
                echo json_encode(['error' => 'Orden no encontrada']);
                return;
            }
            
            $orden = $this->enrichOrdenData($orden);
            
            echo json_encode($orden);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener orden',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Crear nueva orden - POST /api/ordenes
     */
    public function create() {
        try {
            $userData = requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar datos antes de procesar
            $validationErrors = $this->validateOrdenData($data);
            if (!empty($validationErrors)) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Datos inválidos',
                    'validation_errors' => $validationErrors
                ]);
                return;
            }
            
            // Preparar datos para el stored procedure
            $cliente_id = $this->upsertCliente($data['cliente']);
            $vehiculo_id = $this->upsertVehiculo($data['vehiculo'], $cliente_id);
            
            // Generar número de orden
            $stmt = $this->db->prepare('CALL sp_generate_numero_orden(@numero_orden)');
            $stmt->execute();
            $stmt = $this->db->prepare('SELECT @numero_orden as numero_orden');
            $stmt->execute();
            $numero_orden = $stmt->fetch()['numero_orden'];
            
            // Calcular totales
            $resumen = $data['resumen'] ?? [];
            $subtotal = ($resumen['servicios'] ?? 0) + ($resumen['manoDeObra'] ?? 0) + ($resumen['refacciones'] ?? 0);
            $descuento = $resumen['descuento'] ?? 0;
            $iva_porcentaje = $resumen['incluirIVA'] ? 16 : 0;
            $iva_monto = $resumen['iva'] ?? 0;
            $total = $resumen['total'] ?? 0;
            $anticipo = $resumen['anticipo'] ?? 0;
            
            // Crear orden usando stored procedure - Estado inicial: 1 (Recibido)
            $stmt = $this->db->prepare('
                CALL sp_orden_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @orden_id)
            ');
            
            $vehiculoData = $data['vehiculo'] ?? [];
            $fechaPromesa = isset($data['fechaSalida']) && $data['fechaSalida'] 
                ? date('Y-m-d H:i:s', strtotime($data['fechaSalida'])) 
                : null;
            
            $stmt->execute([
                $numero_orden,
                $cliente_id,
                $vehiculo_id,
                $userData['userId'],
                $data['problemaReportado'] ?? '',
                $data['diagnosticoTecnico'] ?? '',
                1, // estado_id inicial (Recibido)
                'media', // prioridad por defecto
                $vehiculoData['kilometrajeEntrada'] ?? '',
                $vehiculoData['kilometrajeSalida'] ?? '',
                $vehiculoData['nivelCombustible'] ?? 0,
                $subtotal,
                $descuento,
                $iva_porcentaje,
                $iva_monto,
                $total,
                $anticipo,
                $fechaPromesa
            ]);
            
            // Obtener ID de la orden creada
            $stmt = $this->db->prepare('SELECT @orden_id as orden_id');
            $stmt->execute();
            $orden_id = $stmt->fetch()['orden_id'];
            
            // Insertar servicios
            if (isset($data['servicios']) && !empty($data['servicios'])) {
                $this->insertServiciosOrden($orden_id, $data['servicios']);
            }
            
            if (isset($data['manoDeObra']) && !empty($data['manoDeObra'])) {
                $this->insertServiciosOrden($orden_id, $data['manoDeObra']);
            }
            
            // Insertar refacciones
            if (isset($data['refacciones']) && !empty($data['refacciones'])) {
                $this->insertRefaccionesOrden($orden_id, $data['refacciones']);
            }
            
            // Insertar inspección
            if (isset($data['inspeccion'])) {
                $this->insertInspeccionVehiculo($orden_id, $data['inspeccion']);
            }
            
            // Insertar puntos de seguridad
            if (isset($data['puntosSeguridad']) && !empty($data['puntosSeguridad'])) {
                $this->insertPuntosSeguridad($orden_id, $data['puntosSeguridad']);
            }
            
            // Retornar orden completa
            http_response_code(201);
            $this->getById($orden_id);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al crear orden',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Actualizar orden - PUT /api/ordenes/:id
     */
    public function update($id) {
        try {
            $userData = requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Verificar que la orden existe
            $stmt = $this->db->prepare('CALL sp_orden_find_by_id(?)');
            $stmt->execute([$id]);
            $ordenExistente = $stmt->fetch();
            
            if (!$ordenExistente) {
                http_response_code(404);
                echo json_encode(['error' => 'Orden no encontrada']);
                return;
            }
            
            // Preparar datos para actualización
            $resumen = $data['resumen'] ?? [];
            $subtotal = ($resumen['servicios'] ?? 0) + ($resumen['manoDeObra'] ?? 0) + ($resumen['refacciones'] ?? 0);
            $descuento = $resumen['descuento'] ?? 0;
            $iva_porcentaje = $resumen['incluirIVA'] ? 16 : 0;
            $iva_monto = $resumen['iva'] ?? 0;
            $total = $resumen['total'] ?? 0;
            $anticipo = $resumen['anticipo'] ?? 0;
            
            $vehiculoData = $data['vehiculo'] ?? [];
            $fechaPromesa = isset($data['fechaSalida']) && $data['fechaSalida'] 
                ? date('Y-m-d H:i:s', strtotime($data['fechaSalida'])) 
                : null;
            
            // Actualizar usando stored procedure
            $stmt = $this->db->prepare('
                CALL sp_orden_update(?, ?, ?, ?, ?, ?, ?, 1, "media", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            
            $stmt->execute([
                $id,
                $ordenExistente['numero_orden'],
                $ordenExistente['cliente_id'],
                $ordenExistente['vehiculo_id'],
                $userData['userId'],
                $data['problemaReportado'] ?? '',
                $data['diagnosticoTecnico'] ?? '',
                $vehiculoData['kilometrajeEntrada'] ?? '',
                $vehiculoData['kilometrajeSalida'] ?? '',
                $vehiculoData['nivelCombustible'] ?? 0,
                $subtotal,
                $descuento,
                $iva_porcentaje,
                $iva_monto,
                $total,
                $anticipo,
                $fechaPromesa
            ]);
            
            // Actualizar datos relacionados
            $this->updateDatosRelacionados($id, $data);
            
            // Retornar orden actualizada
            $this->getById($id);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al actualizar orden',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Cambiar estado de orden - PATCH /api/ordenes/:id/estado
     */
    public function changeStatus($id) {
        try {
            $userData = requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);
            
            $nuevoEstado = $data['estado_id'] ?? null;
            $notas = $data['notas'] ?? '';
            
            if (!$nuevoEstado) {
                http_response_code(400);
                echo json_encode(['error' => 'Estado requerido']);
                return;
            }
            
            $stmt = $this->db->prepare('CALL sp_orden_change_status(?, ?, ?, ?)');
            $stmt->execute([$id, $nuevoEstado, $userData['userId'], $notas]);
            
            $this->getById($id);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al cambiar estado',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Obtener estados disponibles - GET /api/ordenes/estados
     */
    public function getEstados() {
        try {
            requireAuth();
            
            $stmt = $this->db->prepare('
                SELECT id, nombre, color, descripcion, workflow_order, activo 
                FROM estados_orden 
                WHERE activo = 1 
                ORDER BY workflow_order
            ');
            $stmt->execute();
            $estados = $stmt->fetchAll();
            
            echo json_encode($estados);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener estados',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Eliminar orden - DELETE /api/ordenes/:id
     */
    public function delete($id) {
        try {
            requireAuth();
            
            $stmt = $this->db->prepare('DELETE FROM ordenes_servicio WHERE id = ?');
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Orden no encontrada']);
                return;
            }
            
            http_response_code(204);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al eliminar orden',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private function enrichOrdenData($orden) {
        // Obtener servicios usando stored procedure
        $stmt = $this->db->prepare('CALL sp_orden_get_servicios(?)');
        $stmt->execute([$orden['id']]);
        $serviciosDB = $stmt->fetchAll();
        
        $orden['servicios'] = [];
        $orden['manoDeObra'] = [];
        foreach ($serviciosDB as $servicio) {
            $item = [
                'id' => (string)$servicio['id'],
                'descripcion' => $servicio['descripcion'],
                'precio' => (float)$servicio['precio_unitario'],
                'cantidad' => (float)$servicio['cantidad'],
                'subtotal' => (float)$servicio['subtotal']
            ];
            
            // Separar por categoría del catálogo
            $categoria = $servicio['categoria'] ?? 'mano_obra';
            if (strpos(strtolower($categoria), 'servicio') !== false) {
                $orden['servicios'][] = $item;
            } else {
                $orden['manoDeObra'][] = $item;
            }
        }
        
        // Obtener refacciones usando stored procedure
        $stmt = $this->db->prepare('CALL sp_orden_get_refacciones(?)');
        $stmt->execute([$orden['id']]);
        $refacciones = $stmt->fetchAll();
        
        $orden['refacciones'] = [];
        foreach ($refacciones as $refaccion) {
            $orden['refacciones'][] = [
                'id' => (string)$refaccion['id'],
                'nombre' => $refaccion['descripcion'],
                'cantidad' => (float)$refaccion['cantidad'],
                'precioVenta' => (float)$refaccion['precio_unitario'],
                'total' => (float)$refaccion['subtotal']
            ];
        }
        
        // Obtener inspección usando stored procedure
        $stmt = $this->db->prepare('CALL sp_orden_get_inspeccion(?)');
        $stmt->execute([$orden['id']]);
        $inspeccionDB = $stmt->fetchAll();
        
        $orden['inspeccion'] = [
            'exteriores' => [],
            'interiores' => [],
            'danosAdicionales' => []
        ];
        
        foreach ($inspeccionDB as $elemento) {
            $categoria = strtolower($elemento['categoria'] ?? 'exterior');
            $key = $categoria === 'interior' ? 'interiores' : 'exteriores';
            
            $orden['inspeccion'][$key][$elemento['nombre']] = $elemento['estado'] === 'bueno';
        }
        
        // Mapear campos para compatibilidad con frontend
        $orden['problemaReportado'] = $orden['problema_reportado'] ?? '';
        $orden['diagnosticoTecnico'] = $orden['diagnostico'] ?? '';
        $orden['fechaSalida'] = $orden['fecha_promesa'] ?? null;
        
        // Vehiculo data
        $orden['vehiculo'] = [
            'kilometrajeEntrada' => $orden['kilometraje_entrada'] ?? '',
            'kilometrajeSalida' => $orden['kilometraje_salida'] ?? '',
            'nivelCombustible' => $orden['nivel_combustible'] ?? 0
        ];
        
        // Resumen financiero
        $orden['resumen'] = [
            'servicios' => (float)($orden['subtotal'] ?? 0),
            'manoDeObra' => 0, // Se calcula desde servicios
            'refacciones' => 0, // Se calcula desde refacciones
            'subtotal' => (float)($orden['subtotal'] ?? 0),
            'descuento' => (float)($orden['descuento'] ?? 0),
            'incluirIVA' => (bool)($orden['iva_porcentaje'] > 0),
            'iva' => (float)($orden['iva_monto'] ?? 0),
            'total' => (float)($orden['total'] ?? 0),
            'anticipo' => (float)($orden['anticipo'] ?? 0),
            'restante' => (float)($orden['total'] ?? 0) - (float)($orden['anticipo'] ?? 0)
        ];
        
        // Obtener puntos de seguridad (si existen)
        $orden['puntosSeguridad'] = $this->getPuntosSeguridad($orden['id']);
        
        return $orden;
    }
    
    private function getPuntosSeguridad($orden_id) {
        try {
            // Query directo ya que el SP aún no maneja puntos de seguridad
            $stmt = $this->db->prepare('
                SELECT ops.*, ps.nombre as punto_nombre, ps.categoria, 
                       es.nombre as estado_nombre, es.color
                FROM orden_puntos_seguridad ops
                LEFT JOIN puntos_seguridad_catalogo ps ON ops.punto_seguridad_id = ps.id
                LEFT JOIN estados_seguridad es ON ops.estado_id = es.id
                WHERE ops.orden_id = ?
                ORDER BY ops.id
            ');
            $stmt->execute([$orden_id]);
            $puntosDB = $stmt->fetchAll();
            
            $puntos = [];
            foreach ($puntosDB as $punto) {
                $puntos[] = [
                    'id' => (int)$punto['id'],
                    'puntoId' => (int)$punto['punto_seguridad_id'],
                    'estadoId' => (int)$punto['estado_id'],
                    'observaciones' => $punto['notas'] ?? '',
                    'punto' => [
                        'nombre' => $punto['punto_nombre'] ?? 'Punto sin nombre',
                        'categoria' => $punto['categoria'] ?? 'General'
                    ],
                    'estado' => [
                        'nombre' => $punto['estado_nombre'] ?? 'Sin estado',
                        'color' => $punto['color'] ?? '#gray'
                    ]
                ];
            }
            
            return $puntos;
            
        } catch (Exception $e) {
            error_log('Error obteniendo puntos de seguridad: ' . $e->getMessage());
            return [];
        }
    }
    
    private function upsertCliente($clienteData) {
        $nombre = $clienteData['nombreCompleto'] ?? $clienteData['nombre'] ?? '';
        $telefono = $clienteData['telefono'] ?? '';
        $email = $clienteData['email'] ?? '';
        $direccion = $clienteData['domicilio'] ?? $clienteData['direccion'] ?? '';
        
        // Insertar nuevo cliente
        $stmt = $this->db->prepare('
            INSERT INTO clientes (nombre, telefono, email, direccion, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ');
        $stmt->execute([$nombre, $telefono, $email, $direccion]);
        return $this->db->lastInsertId();
    }
    
    private function upsertVehiculo($vehiculoData, $cliente_id) {
        $marca = $vehiculoData['marca'] ?? '';
        $modelo = $vehiculoData['modelo'] ?? '';
        $anio = $vehiculoData['anio'] ?? null;
        $color = $vehiculoData['color'] ?? '';
        $placas = $vehiculoData['placas'] ?? '';
        $niv = $vehiculoData['niv'] ?? '';
        
        // Buscar vehículo existente por placas
        $stmt = $this->db->prepare('SELECT id FROM vehiculos WHERE placas = ? LIMIT 1');
        $stmt->execute([$placas]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Actualizar
            $stmt = $this->db->prepare('
                UPDATE vehiculos SET marca = ?, modelo = ?, anio = ?, 
                       color = ?, niv = ?, cliente_id = ?, updated_at = NOW()
                WHERE id = ?
            ');
            $stmt->execute([$marca, $modelo, $anio, $color, $niv, $cliente_id, $existing['id']]);
            return $existing['id'];
        } else {
            // Insertar
            $stmt = $this->db->prepare('
                INSERT INTO vehiculos (marca, modelo, anio, color, placas, niv, cliente_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ');
            $stmt->execute([$marca, $modelo, $anio, $color, $placas, $niv, $cliente_id]);
            return $this->db->lastInsertId();
        }
    }
    
    private function insertServiciosOrden($orden_id, $servicios) {
        $stmt = $this->db->prepare('
            INSERT INTO servicios_orden (orden_id, servicio_id, descripcion, precio_unitario, cantidad, subtotal, created_at)
            VALUES (?, NULL, ?, ?, ?, ?, NOW())
        ');
        
        foreach ($servicios as $servicio) {
            $cantidad = $servicio['horas'] ?? $servicio['cantidad'] ?? 1;
            $precioUnitario = $servicio['precio'] ?? $servicio['precio_unitario'] ?? 0;
            $subtotal = $cantidad * $precioUnitario;
            
            $stmt->execute([
                $orden_id,
                $servicio['descripcion'],
                $precioUnitario,
                $cantidad,
                $subtotal
            ]);
        }
    }
    
    private function insertRefaccionesOrden($orden_id, $refacciones) {
        $stmt = $this->db->prepare('
            INSERT INTO refacciones_orden (orden_id, descripcion, cantidad, precio_unitario, subtotal, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ');
        
        foreach ($refacciones as $refaccion) {
            $cantidad = $refaccion['cantidad'] ?? 1;
            $precioUnitario = $refaccion['precioVenta'] ?? $refaccion['precio_unitario'] ?? 0;
            $subtotal = $refaccion['total'] ?? ($cantidad * $precioUnitario);
            
            $stmt->execute([
                $orden_id,
                $refaccion['nombre'] ?? $refaccion['descripcion'],
                $cantidad,
                $precioUnitario,
                $subtotal
            ]);
        }
    }
    
    private function insertInspeccionVehiculo($orden_id, $inspeccionData) {
        $stmt = $this->db->prepare('
            INSERT INTO inspeccion_vehiculo (orden_id, elemento_id, estado, observaciones, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ');
        
        // Mapear elementos de inspección del frontend
        $elementos = array_merge(
            $inspeccionData['exteriores'] ?? [],
            $inspeccionData['interiores'] ?? []
        );
        
        foreach ($elementos as $nombre => $estado) {
            // Obtener ID del elemento (o crearlo si no existe)
            $elemento_id = $this->getOrCreateElementoInspeccion($nombre);
            
            $stmt->execute([
                $orden_id,
                $elemento_id,
                $estado ? 'bueno' : 'malo',
                ''
            ]);
        }
    }
    
    private function getOrCreateElementoInspeccion($nombre) {
        // Buscar elemento existente
        $stmt = $this->db->prepare('SELECT id FROM elementos_inspeccion WHERE nombre = ? LIMIT 1');
        $stmt->execute([$nombre]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            return $existing['id'];
        }
        
        // Crear nuevo elemento
        $categoria = $this->determinarCategoriaElemento($nombre);
        $stmt = $this->db->prepare('
            INSERT INTO elementos_inspeccion (nombre, categoria, descripcion, es_critico, created_at)
            VALUES (?, ?, ?, 0, NOW())
        ');
        $stmt->execute([$nombre, $categoria, $nombre]);
        return $this->db->lastInsertId();
    }
    
    private function determinarCategoriaElemento($nombre) {
        $interiores = ['radio', 'encendedor', 'documentos', 'bocinas', 'calefaccion', 'sistemaSonido'];
        return in_array($nombre, $interiores) ? 'interior' : 'exterior';
    }
    
    private function insertPuntosSeguridad($orden_id, $puntos) {
        $stmt = $this->db->prepare('
            INSERT INTO orden_puntos_seguridad (orden_id, punto_seguridad_id, estado_id, notas, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ');
        
        foreach ($puntos as $punto) {
            $stmt->execute([
                $orden_id,
                $punto['puntoId'] ?? $punto['punto_id'] ?? 1,
                $punto['estadoId'] ?? $punto['estado_id'] ?? 1,
                $punto['observaciones'] ?? $punto['notas'] ?? ''
            ]);
        }
    }
    
    private function updateDatosRelacionados($orden_id, $data) {
        // Actualizar servicios
        if (isset($data['servicios']) || isset($data['manoDeObra'])) {
            $this->db->prepare('DELETE FROM servicios_orden WHERE orden_id = ?')->execute([$orden_id]);
            
            if (isset($data['servicios']) && !empty($data['servicios'])) {
                $this->insertServiciosOrden($orden_id, $data['servicios']);
            }
            
            if (isset($data['manoDeObra']) && !empty($data['manoDeObra'])) {
                $this->insertServiciosOrden($orden_id, $data['manoDeObra']);
            }
        }
        
        // Actualizar refacciones
        if (isset($data['refacciones'])) {
            $this->db->prepare('DELETE FROM refacciones_orden WHERE orden_id = ?')->execute([$orden_id]);
            if (!empty($data['refacciones'])) {
                $this->insertRefaccionesOrden($orden_id, $data['refacciones']);
            }
        }
        
        // Actualizar inspección
        if (isset($data['inspeccion'])) {
            $this->db->prepare('DELETE FROM inspeccion_vehiculo WHERE orden_id = ?')->execute([$orden_id]);
            $this->insertInspeccionVehiculo($orden_id, $data['inspeccion']);
        }
        
        // Actualizar puntos de seguridad
        if (isset($data['puntosSeguridad'])) {
            $this->db->prepare('DELETE FROM orden_puntos_seguridad WHERE orden_id = ?')->execute([$orden_id]);
            if (!empty($data['puntosSeguridad'])) {
                $this->insertPuntosSeguridad($orden_id, $data['puntosSeguridad']);
            }
        }
    }
    
    private function validateOrdenData($data) {
        $errors = [];
        
        // Validación básica del cliente
        if (!isset($data['cliente']['nombreCompleto']) || empty($data['cliente']['nombreCompleto'])) {
            $errors['cliente.nombre'] = 'Nombre del cliente requerido';
        }
        
        // Validación básica del vehículo
        if (!isset($data['vehiculo']['marca']) || empty($data['vehiculo']['marca'])) {
            $errors['vehiculo.marca'] = 'Marca del vehículo requerida';
        }
        
        if (!isset($data['vehiculo']['modelo']) || empty($data['vehiculo']['modelo'])) {
            $errors['vehiculo.modelo'] = 'Modelo del vehículo requerido';
        }
        
        // Validación del problema reportado
        if (!isset($data['problemaReportado']) || empty($data['problemaReportado'])) {
            $errors['problemaReportado'] = 'Problema reportado requerido';
        }
        
        return $errors;
    }
}