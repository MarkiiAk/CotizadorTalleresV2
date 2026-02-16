<?php

class EstadosSeguridadController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * GET /api/estados-seguridad
     * Obtener todos los estados de seguridad activos
     */
    public function getEstados() {
        try {
            $stmt = $this->db->prepare("CALL GetEstadosSeguridad()");
            $stmt->execute();
            $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Formatear para el frontend
            $estadosFormatted = array_map(function($estado) {
                return [
                    'id' => (int)$estado['id'],
                    'nombre' => $estado['nombre'],
                    'color' => $estado['color'],
                    'descripcion' => $estado['descripcion'],
                    'orden' => (int)$estado['orden_visualizacion'],
                    'activo' => (bool)$estado['activo'],
                    'icon' => $estado['icon'] ?? $this->getIconoForEstado($estado['nombre'])
                ];
            }, $estados);

            http_response_code(200);
            echo json_encode($estadosFormatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener estados de seguridad',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener icono basado en el nombre del estado
     */
    private function getIconoForEstado($nombre) {
        switch ($nombre) {
            case 'Bueno':
                return '✅';
            case 'Recomendado':
                return '⚠️';
            case 'Urgente':
                return '🔴';
            default:
                return '•';
        }
    }

    /**
     * GET /api/estados-seguridad/:id
     * Obtener un estado específico por ID
     */
    public function getEstadoById($id) {
        try {
            $stmt = $this->db->prepare("CALL GetEstadoSeguridadById(?)");
            $stmt->execute([$id]);
            $estado = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$estado) {
                http_response_code(404);
                echo json_encode([
                    'error' => 'Estado no encontrado'
                ]);
                return;
            }

            $estadoFormatted = [
                'id' => (int)$estado['id'],
                'nombre' => $estado['nombre'],
                'color' => $estado['color'],
                'descripcion' => $estado['descripcion'],
                'orden' => (int)$estado['orden_visualizacion'],
                'activo' => (bool)$estado['activo'],
                'icon' => $estado['icon'] ?? $this->getIconoForEstado($estado['nombre'])
            ];

            http_response_code(200);
            echo json_encode($estadoFormatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener estado',
                'message' => $e->getMessage()
            ]);
        }
    }
}