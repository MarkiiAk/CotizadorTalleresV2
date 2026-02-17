-- =====================================================
-- MIGRACIÓN ULTRA SIMPLE: Compatible con cPanel
-- Sin PREPARE ni information_schema
-- =====================================================

-- PASO 1: Crear tabla principal
CREATE TABLE IF NOT EXISTS orden_seguimiento_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orden_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    vehiculo_info VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PASO 2: Eliminar tabla conflictiva del schema v2
DROP TABLE IF EXISTS tracking_tokens;

-- PASO 3: Intentar agregar foreign key (IGNORAR si falla)
ALTER TABLE orden_seguimiento_tokens 
ADD CONSTRAINT fk_orden_tokens_orden_id 
FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE;

-- PASO 4: Agregar índices (IGNORAR si fallan)
ALTER TABLE orden_seguimiento_tokens ADD INDEX idx_token (token);
ALTER TABLE orden_seguimiento_tokens ADD INDEX idx_orden_id (orden_id);
ALTER TABLE orden_seguimiento_tokens ADD INDEX idx_activo (activo);

-- Mensaje de confirmación
SELECT 'Tabla orden_seguimiento_tokens creada correctamente - tokens de seguimiento listos' as resultado;