<?php

class PuntosSeguridadController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * GET /api/puntos-seguridad/catalogo
     * Obtener catálogo completo de puntos de seguridad activos
     */
    public function getCatalogo() {
        try {
            $query = "SELECT id, nombre, categoria, descripcion, orden_visualizacion, es_critico, activo 
                      FROM puntos_seguridad_catalogo 
                      WHERE activo = 1 
                      ORDER BY orden_visualizacion ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $puntos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convertir a formato esperado por el frontend
            $puntosFormatted = array_map(function($punto) {
                return [
                    'id' => (int)$punto['id'],
                    'nombre' => $punto['nombre'],
                    'categoria' => $punto['categoria'],
                    'descripcion' => $punto['descripcion'],
                    'orden' => (int)$punto['orden_visualizacion'],
                    'esCritico' => (bool)$punto['es_critico'],
                    'activo' => (bool)$punto['activo'],
                    'ubicacion' => null // No existe en la tabla pero frontend lo espera
                ];
            }, $puntos);

            http_response_code(200);
            echo json_encode($puntosFormatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener catálogo de puntos de seguridad',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/puntos-seguridad/catalogo/:id
     * Obtener un punto específico del catálogo
     */
    public function getPuntoById($id) {
        try {
            $query = "SELECT id, nombre, categoria, descripcion, orden_visualizacion, es_critico, activo 
                      FROM puntos_seguridad_catalogo 
                      WHERE id = :id";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $punto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$punto) {
                http_response_code(404);
                echo json_encode([
                    'error' => 'Punto de seguridad no encontrado'
                ]);
                return;
            }

            $puntoFormatted = [
                'id' => (int)$punto['id'],
                'nombre' => $punto['nombre'],
                'categoria' => $punto['categoria'],
                'descripcion' => $punto['descripcion'],
                'orden' => (int)$punto['orden_visualizacion'],
                'esCritico' => (bool)$punto['es_critico'],
                'activo' => (bool)$punto['activo'],
                'ubicacion' => null
            ];

            http_response_code(200);
            echo json_encode($puntoFormatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener punto de seguridad',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/ordenes/:ordenId/puntos-seguridad
     * Obtener puntos de seguridad de una orden específica con su estado
     */
    public function getPuntosByOrden($ordenId) {
        try {
            $query = "SELECT 
                        ops.id,
                        ops.punto_seguridad_id as puntoId,
                        ops.estado_id as estadoId,
                        ops.notas,
                        psc.nombre as puntoNombre,
                        psc.categoria,
                        es.nombre as estadoNombre,
                        es.color as estadoColor
                      FROM orden_puntos_seguridad ops
                      INNER JOIN puntos_seguridad_catalogo psc ON ops.punto_seguridad_id = psc.id
                      INNER JOIN estados_seguridad es ON ops.estado_id = es.id
                      WHERE ops.orden_id = :orden_id
                      ORDER BY psc.orden_visualizacion ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':orden_id', $ordenId, PDO::PARAM_INT);
            $stmt->execute();
            $puntos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Formatear datos para el frontend
            $puntosFormatted = array_map(function($punto) {
                return [
                    'id' => (int)$punto['id'],
                    'puntoId' => (int)$punto['puntoId'],
                    'estadoId' => (int)$punto['estadoId'],
                    'puntoNombre' => $punto['puntoNombre'],
                    'categoria' => $punto['categoria'],
                    'estadoNombre' => $punto['estadoNombre'],
                    'estadoColor' => $punto['estadoColor'],
                    'notas' => $punto['notas'],
                    'observaciones' => $punto['notas'] // Alias para frontend
                ];
            }, $puntos);

            http_response_code(200);
            echo json_encode($puntosFormatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener puntos de seguridad de la orden',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /api/ordenes/:ordenId/puntos-seguridad
     * Guardar/actualizar puntos de seguridad de una orden
     * Espera un array de puntos: [{ puntoId, estadoId, notas? }]
     */
    public function savePuntosByOrden($ordenId, $data) {
        try {
            // Validar que vengan datos (puede ser array directo o envuelto en 'puntos')
            $puntos = isset($data['puntos']) ? $data['puntos'] : $data;
            
            if (!is_array($puntos) || empty($puntos)) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Se requiere un array de puntos'
                ]);
                return;
            }

            // Verificar que la orden existe
            $checkOrden = "SELECT id FROM ordenes_servicio WHERE id = :orden_id";
            $stmtCheck = $this->db->prepare($checkOrden);
            $stmtCheck->bindParam(':orden_id', $ordenId, PDO::PARAM_INT);
            $stmtCheck->execute();
            
            if (!$stmtCheck->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'error' => 'Orden no encontrada'
                ]);
                return;
            }

            $this->db->beginTransaction();

            try {
                // Eliminar puntos existentes de esta orden
                $deleteQuery = "DELETE FROM orden_puntos_seguridad WHERE orden_id = :orden_id";
                $stmtDelete = $this->db->prepare($deleteQuery);
                $stmtDelete->bindParam(':orden_id', $ordenId, PDO::PARAM_INT);
                $stmtDelete->execute();

                // Insertar nuevos puntos
                $insertQuery = "INSERT INTO orden_puntos_seguridad 
                                (orden_id, punto_seguridad_id, estado_id, notas) 
                                VALUES (:orden_id, :punto_id, :estado_id, :notas)";
                $stmtInsert = $this->db->prepare($insertQuery);

                foreach ($puntos as $punto) {
                    // Validar campos requeridos
                    if (!isset($punto['puntoId']) || !isset($punto['estadoId'])) {
                        throw new Exception('Cada punto debe tener puntoId y estadoId');
                    }

                    $stmtInsert->bindParam(':orden_id', $ordenId, PDO::PARAM_INT);
                    $stmtInsert->bindParam(':punto_id', $punto['puntoId'], PDO::PARAM_INT);
                    $stmtInsert->bindParam(':estado_id', $punto['estadoId'], PDO::PARAM_INT);
                    $notas = $punto['observaciones'] ?? $punto['notas'] ?? null;
                    $stmtInsert->bindValue(':notas', $notas);
                    $stmtInsert->execute();
                }

                $this->db->commit();

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Puntos de seguridad guardados exitosamente',
                    'ordenId' => (int)$ordenId,
                    'puntosGuardados' => count($puntos)
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al guardar puntos de seguridad',
                'message' => $e->getMessage()
            ]);
        }
    }
}