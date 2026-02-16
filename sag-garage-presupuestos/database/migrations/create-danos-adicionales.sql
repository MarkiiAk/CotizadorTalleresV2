-- Migración para crear tabla de daños adicionales
-- Fecha: 2026-02-16

-- Crear tabla danos_adicionales
CREATE TABLE IF NOT EXISTS danos_adicionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_servicio_id INT NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    tipo_dano VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clave foránea
    CONSTRAINT fk_danos_orden_servicio 
        FOREIGN KEY (orden_servicio_id) 
        REFERENCES ordenes_servicio(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices
CREATE INDEX idx_danos_orden_servicio ON danos_adicionales(orden_servicio_id);