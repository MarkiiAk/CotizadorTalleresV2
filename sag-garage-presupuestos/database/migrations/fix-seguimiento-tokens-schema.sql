-- =====================================================
-- MIGRACIÓN: Armonizar tokens de seguimiento
-- Corregir inconsistencias entre schema v2 y migración
-- =====================================================

-- Verificar y eliminar tabla tracking_tokens si existe (del schema v2)
DROP TABLE IF EXISTS tracking_tokens;

-- Crear tabla orden_seguimiento_tokens como la autoridad
-- (Esta es la que usa el controlador corregido)
CREATE TABLE IF NOT EXISTS orden_seguimiento_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orden_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    vehiculo_info VARCHAR(255) NOT NULL, -- "Marca Modelo Año - Placas"
    activo BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NULL, -- NULL = nunca expira
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_orden_id (orden_id),
    INDEX idx_activo (activo)
);

-- Actualizar stored procedures para usar la tabla correcta
DELIMITER $$

-- Eliminar procedures existentes
DROP FUNCTION IF EXISTS generate_seguimiento_token$$
DROP PROCEDURE IF EXISTS sp_create_seguimiento_token$$
DROP PROCEDURE IF EXISTS sp_get_seguimiento_info$$
DROP PROCEDURE IF EXISTS sp_get_seguimiento_timeline$$

-- Crear función para generar token único (hexadecimal de 64 caracteres)
CREATE FUNCTION generate_seguimiento_token() 
RETURNS VARCHAR(64)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE token VARCHAR(64);
    DECLARE token_exists INT DEFAULT 1;
    
    WHILE token_exists > 0 DO
        -- Generar token SHA-256 like (más seguro que la versión anterior)
        SET token = LOWER(CONCAT(
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8),
            SUBSTRING(MD5(RAND()), 1, 8)
        ));
        
        -- Verificar si el token ya existe
        SELECT COUNT(*) INTO token_exists 
        FROM orden_seguimiento_tokens 
        WHERE token = token;
    END WHILE;
    
    RETURN token;
END$$

-- Stored procedure para crear token de seguimiento
CREATE PROCEDURE sp_create_seguimiento_token(
    IN p_orden_id INT,
    OUT p_token VARCHAR(64)
)
BEGIN
    DECLARE v_cliente_nombre VARCHAR(255);
    DECLARE v_vehiculo_info VARCHAR(255);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Obtener información de la orden
    SELECT 
        c.nombre,
        CONCAT(v.marca, ' ', v.modelo, ' ', COALESCE(v.anio, ''), ' - ', v.placas)
    INTO v_cliente_nombre, v_vehiculo_info
    FROM ordenes_servicio o
    JOIN clientes c ON o.cliente_id = c.id
    JOIN vehiculos v ON o.vehiculo_id = v.id
    WHERE o.id = p_orden_id;

    IF v_cliente_nombre IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Orden no encontrada';
    END IF;

    -- Generar token único
    SET p_token = generate_seguimiento_token();

    -- Crear registro de token
    INSERT INTO orden_seguimiento_tokens (orden_id, token, cliente_nombre, vehiculo_info)
    VALUES (p_orden_id, p_token, v_cliente_nombre, v_vehiculo_info);

    COMMIT;
END$$

-- Stored procedure para obtener información de seguimiento
CREATE PROCEDURE sp_get_seguimiento_info(
    IN p_token VARCHAR(64)
)
BEGIN
    SELECT 
        ost.token,
        ost.cliente_nombre,
        ost.vehiculo_info,
        o.numero_orden,
        o.fecha_ingreso,
        o.fecha_promesa,
        o.problema_reportado,
        e.nombre as estado_actual,
        e.descripcion as estado_descripcion,
        e.color as estado_color,
        o.total,
        o.anticipo,
        (o.total - o.anticipo) as saldo_pendiente
    FROM orden_seguimiento_tokens ost
    JOIN ordenes_servicio o ON ost.orden_id = o.id
    JOIN estados_orden e ON o.estado_id = e.id
    WHERE ost.token = p_token 
      AND ost.activo = TRUE
      AND (ost.expires_at IS NULL OR ost.expires_at > NOW());
END$$

-- Stored procedure para obtener timeline de seguimiento (usando orden_timeline)
CREATE PROCEDURE sp_get_seguimiento_timeline(
    IN p_token VARCHAR(64)
)
BEGIN
    SELECT 
        ot.created_at as fecha,
        en.nombre as estado,
        en.descripcion,
        en.color,
        CASE 
            WHEN ot.notas IS NOT NULL AND ot.notas != '' 
            THEN ot.notas
            ELSE 'Estado actualizado'
        END as mensaje
    FROM orden_seguimiento_tokens ost
    JOIN ordenes_servicio o ON ost.orden_id = o.id
    JOIN orden_timeline ot ON o.id = ot.orden_id
    JOIN estados_orden en ON ot.estado_nuevo_id = en.id
    WHERE ost.token = p_token 
      AND ost.activo = TRUE
      AND (ost.expires_at IS NULL OR ost.expires_at > NOW())
    ORDER BY ot.created_at ASC;
END$$

DELIMITER ;

-- Mensaje de confirmación
SELECT 'Migración completada: Tokens de seguimiento armonizados correctamente' as mensaje;