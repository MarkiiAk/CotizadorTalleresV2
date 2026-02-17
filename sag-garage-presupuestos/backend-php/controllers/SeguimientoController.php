<?php
/**
 * Controlador para seguimiento público de órdenes
 * Permite a los clientes ver el estado de su orden sin autenticación
 */

class SeguimientoController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Crear token de seguimiento para una orden - POST /api/seguimiento/crear-token
     */
    public function crearToken() {
        try {
            requireAuth(); // Solo usuarios autenticados pueden crear tokens
            $data = json_decode(file_get_contents('php://input'), true);
            
            $orden_id = $data['orden_id'] ?? null;
            
            if (!$orden_id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de orden requerido']);
                return;
            }
            
            // Verificar que la orden existe
            $stmt = $this->db->prepare('SELECT id FROM ordenes_servicio WHERE id = ?');
            $stmt->execute([$orden_id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Orden no encontrada']);
                return;
            }
            
            // Verificar si ya existe un token activo para esta orden
            $stmt = $this->db->prepare('
                SELECT token FROM orden_seguimiento_tokens 
                WHERE orden_id = ? AND activo = TRUE 
                AND (expires_at IS NULL OR expires_at > NOW())
                LIMIT 1
            ');
            $stmt->execute([$orden_id]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Retornar token existente
                echo json_encode([
                    'success' => true,
                    'token' => $existing['token'],
                    'url' => $this->generateTrackingUrl($existing['token']),
                    'message' => 'Token existente reutilizado'
                ]);
                return;
            }
            
            // Crear nuevo token
            $stmt = $this->db->prepare('CALL sp_create_seguimiento_token(?, @token)');
            $stmt->execute([$orden_id]);
            $stmt->closeCursor();
            
            // Obtener el token generado
            $stmt = $this->db->prepare('SELECT @token as token');
            $stmt->execute();
            $result = $stmt->fetch();
            
            if (!$result || !$result['token']) {
                throw new Exception('Error al generar token');
            }
            
            echo json_encode([
                'success' => true,
                'token' => $result['token'],
                'url' => $this->generateTrackingUrl($result['token']),
                'message' => 'Token creado exitosamente'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al crear token de seguimiento',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Obtener información de seguimiento - GET /api/seguimiento/:token
     */
    public function getSeguimientoInfo($token) {
        try {
            // NO requiere autenticación - es público
            
            if (!$token || strlen($token) < 10) {
                http_response_code(400);
                echo json_encode(['error' => 'Token inválido']);
                return;
            }
            
            $stmt = $this->db->prepare('CALL sp_get_seguimiento_info(?)');
            $stmt->execute([$token]);
            $info = $stmt->fetch();
            $stmt->closeCursor();
            
            if (!$info) {
                http_response_code(404);
                echo json_encode(['error' => 'Token no encontrado o expirado']);
                return;
            }
            
            // Obtener timeline
            $stmt = $this->db->prepare('CALL sp_get_seguimiento_timeline(?)');
            $stmt->execute([$token]);
            $timeline = $stmt->fetchAll();
            $stmt->closeCursor();
            
            // Formatear respuesta amigable para el cliente
            $response = [
                'orden' => [
                    'numero' => $info['numero_orden'],
                    'cliente' => $info['cliente_nombre'],
                    'vehiculo' => $info['vehiculo_info'],
                    'problema' => $info['problema_reportado'],
                    'fechaIngreso' => $info['fecha_ingreso'],
                    'fechaPromesa' => $info['fecha_promesa']
                ],
                'estado' => [
                    'actual' => $info['estado_actual'],
                    'descripcion' => $info['estado_descripcion'],
                    'color' => $info['estado_color']
                ],
                'resumen' => [
                    'total' => (float)($info['total'] ?? 0),
                    'anticipo' => (float)($info['anticipo'] ?? 0),
                    'saldoPendiente' => (float)($info['saldo_pendiente'] ?? 0)
                ],
                'timeline' => $this->formatTimeline($timeline)
            ];
            
            echo json_encode($response);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener información de seguimiento',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Listar tokens de una orden - GET /api/seguimiento/orden/:orden_id/tokens
     */
    public function getTokensOrden($orden_id) {
        try {
            requireAuth(); // Solo usuarios autenticados
            
            $stmt = $this->db->prepare('
                SELECT 
                    ost.*,
                    o.numero_orden
                FROM orden_seguimiento_tokens ost
                JOIN ordenes_servicio o ON ost.orden_id = o.id
                WHERE ost.orden_id = ?
                ORDER BY ost.created_at DESC
            ');
            $stmt->execute([$orden_id]);
            $tokens = $stmt->fetchAll();
            
            // Agregar URLs de seguimiento
            foreach ($tokens as &$token) {
                $token['url'] = $this->generateTrackingUrl($token['token']);
                $token['activo'] = (bool)$token['activo'];
            }
            
            echo json_encode($tokens);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener tokens',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Desactivar token - DELETE /api/seguimiento/token/:token
     */
    public function desactivarToken($token) {
        try {
            requireAuth(); // Solo usuarios autenticados
            
            $stmt = $this->db->prepare('
                UPDATE orden_seguimiento_tokens 
                SET activo = FALSE, updated_at = NOW() 
                WHERE token = ?
            ');
            $stmt->execute([$token]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Token no encontrado']);
                return;
            }
            
            echo json_encode(['success' => true, 'message' => 'Token desactivado']);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al desactivar token',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private function generateTrackingUrl($token) {
        // Generar URL completa para seguimiento público
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        
        return $protocol . $host . '/seguimiento/' . $token;
    }
    
    private function formatTimeline($timeline) {
        $formatted = [];
        
        foreach ($timeline as $item) {
            $formatted[] = [
                'fecha' => $item['fecha'],
                'estado' => $item['estado'],
                'descripcion' => $item['descripcion'],
                'mensaje' => $item['mensaje'],
                'color' => $item['color']
            ];
        }
        
        return $formatted;
    }
}