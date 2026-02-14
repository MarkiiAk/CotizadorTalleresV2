-- =====================================================
-- STORED PROCEDURES PARA MÓDULO DE ÓRDENES
-- Sistema de Cotizaciones de Taller
-- Version: 2.0.0 Enterprise
-- =====================================================

DELIMITER $$

-- =====================================================
-- PROCEDURE: sp_orden_find_by_id
-- Buscar orden por ID con todas sus relaciones
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_find_by_id$$
CREATE PROCEDURE sp_orden_find_by_id(
    IN p_orden_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT 
        o.*,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono, 
        c.email as cliente_email,
        c.direccion as cliente_direccion,
        v.marca, v.modelo, v.anio, v.color, v.placas, v.niv,
        e.nombre as estado_nombre,
        e.color as estado_color,
        u.nombre_completo as usuario_nombre
    FROM ordenes_servicio o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
    LEFT JOIN estados_orden e ON o.estado_id = e.id
    LEFT JOIN usuarios u ON o.usuario_id = u.id
    WHERE o.id = p_orden_id;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_find_by_numero
-- Buscar orden por número
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_find_by_numero$$
CREATE PROCEDURE sp_orden_find_by_numero(
    IN p_numero_orden VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT 
        o.*,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono, 
        c.email as cliente_email,
        c.direccion as cliente_direccion,
        v.marca, v.modelo, v.anio, v.color, v.placas, v.niv,
        e.nombre as estado_nombre,
        e.color as estado_color,
        u.nombre_completo as usuario_nombre
    FROM ordenes_servicio o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
    LEFT JOIN estados_orden e ON o.estado_id = e.id
    LEFT JOIN usuarios u ON o.usuario_id = u.id
    WHERE o.numero_orden = p_numero_orden
    LIMIT 1;
END$$

-- =====================================================
-- PROCEDURE: sp_ordenes_list_paginated
-- Listar órdenes con paginación y filtros
-- =====================================================
DROP PROCEDURE IF EXISTS sp_ordenes_list_paginated$$
CREATE PROCEDURE sp_ordenes_list_paginated(
    IN p_estado_id INT,
    IN p_prioridad VARCHAR(20),
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE,
    IN p_cliente_nombre VARCHAR(255),
    IN p_vehiculo_placas VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Calcular offset
    SET v_offset = (p_page - 1) * p_limit;

    SELECT 
        o.*,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        v.marca, v.modelo, v.anio, v.placas,
        e.nombre as estado_nombre,
        e.color as estado_color,
        u.nombre_completo as usuario_nombre
    FROM ordenes_servicio o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
    LEFT JOIN estados_orden e ON o.estado_id = e.id
    LEFT JOIN usuarios u ON o.usuario_id = u.id
    WHERE 
        (p_estado_id IS NULL OR o.estado_id = p_estado_id) AND
        (p_prioridad IS NULL OR o.prioridad = p_prioridad) AND
        (p_fecha_desde IS NULL OR DATE(o.fecha_ingreso) >= p_fecha_desde) AND
        (p_fecha_hasta IS NULL OR DATE(o.fecha_ingreso) <= p_fecha_hasta) AND
        (p_cliente_nombre IS NULL OR c.nombre LIKE CONCAT('%', p_cliente_nombre, '%')) AND
        (p_vehiculo_placas IS NULL OR v.placas LIKE CONCAT('%', p_vehiculo_placas, '%'))
    ORDER BY o.fecha_ingreso DESC, o.id DESC
    LIMIT p_limit OFFSET v_offset;
END$$

-- =====================================================
-- PROCEDURE: sp_ordenes_count_filtered
-- Contar órdenes con filtros
-- =====================================================
DROP PROCEDURE IF EXISTS sp_ordenes_count_filtered$$
CREATE PROCEDURE sp_ordenes_count_filtered(
    IN p_estado_id INT,
    IN p_prioridad VARCHAR(20),
    IN p_fecha_desdeQ DATE,
    IN p_fecha_hasta DATE,
    IN p_cliente_nombre VARCHAR(255),
    IN p_vehiculo_placas VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT COUNT(*) as total_records
    FROM ordenes_servicio o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
    WHERE 
        (p_estado_id IS NULL OR o.estado_id = p_estado_id) AND
        (p_prioridad IS NULL OR o.prioridad = p_prioridad) AND
        (p_fecha_desde IS NULL OR DATE(o.fecha_ingreso) >= p_fecha_desde) AND
        (p_fecha_hasta IS NULL OR DATE(o.fecha_ingreso) <= p_fecha_hasta) AND
        (p_cliente_nombre IS NULL OR c.nombre LIKE CONCAT('%', p_cliente_nombre, '%')) AND
        (p_vehiculo_placas IS NULL OR v.placas LIKE CONCAT('%', p_vehiculo_placas, '%'));
END$$

-- =====================================================
-- PROCEDURE: sp_orden_create
-- Crear nueva orden
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_create$$
CREATE PROCEDURE sp_orden_create(
    IN p_numero_orden VARCHAR(50),
    IN p_cliente_id INT,
    IN p_vehiculo_id INT,
    IN p_usuario_id INT,
    IN p_problema_reportado TEXT,
    IN p_diagnostico TEXT,
    IN p_estado_id INT,
    IN p_prioridad VARCHAR(20),
    IN p_kilometraje_entrada VARCHAR(20),
    IN p_kilometraje_salida VARCHAR(20),
    IN p_nivel_combustible DECIMAL(3,1),
    IN p_subtotal DECIMAL(10,2),
    IN p_descuento DECIMAL(10,2),
    IN p_iva_porcentaje DECIMAL(5,2),
    IN p_iva_monto DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_anticipo DECIMAL(10,2),
    IN p_fecha_promesa DATETIME,
    OUT p_orden_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO ordenes_servicio (
        numero_orden, cliente_id, vehiculo_id, usuario_id,
        problema_reportado, diagnostico, estado_id, prioridad,
        kilometraje_entrada, kilometraje_salida, nivel_combustible,
        subtotal, descuento, iva_porcentaje, iva_monto, total, anticipo,
        fecha_ingreso, fecha_promesa
    ) VALUES (
        p_numero_orden, p_cliente_id, p_vehiculo_id, p_usuario_id,
        p_problema_reportado, p_diagnostico, p_estado_id, p_prioridad,
        p_kilometraje_entrada, p_kilometraje_salida, p_nivel_combustible,
        p_subtotal, p_descuento, p_iva_porcentaje, p_iva_monto, p_total, p_anticipo,
        NOW(), p_fecha_promesa
    );

    SET p_orden_id = LAST_INSERT_ID();

    -- Registrar en timeline
    INSERT INTO orden_timeline (orden_id, estado_anterior_id, estado_nuevo_id, usuario_id, notas)
    VALUES (p_orden_id, 0, p_estado_id, p_usuario_id, 'Orden creada');

    COMMIT;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_update
-- Actualizar orden existente
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_update$$
CREATE PROCEDURE sp_orden_update(
    IN p_orden_id INT,
    IN p_numero_orden VARCHAR(50),
    IN p_cliente_id INT,
    IN p_vehiculo_id INT,
    IN p_usuario_id INT,
    IN p_problema_reportado TEXT,
    IN p_diagnostico TEXT,
    IN p_estado_id INT,
    IN p_prioridad VARCHAR(20),
    IN p_kilometraje_entrada VARCHAR(20),
    IN p_kilometraje_salida VARCHAR(20),
    IN p_nivel_combustible DECIMAL(3,1),
    IN p_subtotal DECIMAL(10,2),
    IN p_descuento DECIMAL(10,2),
    IN p_iva_porcentaje DECIMAL(5,2),
    IN p_iva_monto DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_anticipo DECIMAL(10,2),
    IN p_fecha_promesa DATETIME
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    UPDATE ordenes_servicio SET
        numero_orden = p_numero_orden,
        cliente_id = p_cliente_id,
        vehiculo_id = p_vehiculo_id,
        usuario_id = p_usuario_id,
        problema_reportado = p_problema_reportado,
        diagnostico = p_diagnostico,
        estado_id = p_estado_id,
        prioridad = p_prioridad,
        kilometraje_entrada = p_kilometraje_entrada,
        kilometraje_salida = p_kilometraje_salida,
        nivel_combustible = p_nivel_combustible,
        subtotal = p_subtotal,
        descuento = p_descuento,
        iva_porcentaje = p_iva_porcentaje,
        iva_monto = p_iva_monto,
        total = p_total,
        anticipo = p_anticipo,
        fecha_promesa = p_fecha_promesa,
        updated_at = NOW()
    WHERE id = p_orden_id;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_change_status
-- Cambiar estado de orden con timeline
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_change_status$$
CREATE PROCEDURE sp_orden_change_status(
    IN p_orden_id INT,
    IN p_nuevo_estado_id INT,
    IN p_usuario_id INT,
    IN p_notas TEXT
)
BEGIN
    DECLARE v_estado_anterior INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Obtener estado actual
    SELECT estado_id INTO v_estado_anterior 
    FROM ordenes_servicio 
    WHERE id = p_orden_id;

    IF v_estado_anterior IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Orden no encontrada';
    END IF;

    -- Actualizar estado
    UPDATE ordenes_servicio 
    SET estado_id = p_nuevo_estado_id, 
        updated_at = NOW() 
    WHERE id = p_orden_id;

    -- Registrar en timeline
    INSERT INTO orden_timeline (orden_id, estado_anterior_id, estado_nuevo_id, usuario_id, notas)
    VALUES (p_orden_id, v_estado_anterior, p_nuevo_estado_id, p_usuario_id, p_notas);

    COMMIT;
END$$

-- =====================================================
-- PROCEDURE: sp_dashboard_stats
-- Estadísticas del dashboard
-- =====================================================
DROP PROCEDURE IF EXISTS sp_dashboard_stats$$
CREATE PROCEDURE sp_dashboard_stats(
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT 
        COUNT(*) as total_ordenes,
        SUM(CASE WHEN estado_id IN (1,2,3,4,5,6,7,8) THEN 1 ELSE 0 END) as ordenes_activas,
        SUM(CASE WHEN estado_id = 9 THEN 1 ELSE 0 END) as ordenes_completadas,
        SUM(CASE WHEN estado_id = 10 THEN 1 ELSE 0 END) as ordenes_canceladas,
        SUM(CASE WHEN DATE(fecha_ingreso) = CURDATE() THEN 1 ELSE 0 END) as ordenes_hoy,
        COALESCE(AVG(total), 0) as ticket_promedio,
        COALESCE(SUM(total), 0) as ingresos_totales,
        COALESCE(SUM(anticipo), 0) as anticipos_recibidos,
        COALESCE(SUM(total) - SUM(anticipo), 0) as saldo_pendiente
    FROM ordenes_servicio 
    WHERE 
        (p_fecha_desde IS NULL OR DATE(fecha_ingreso) >= p_fecha_desde) AND
        (p_fecha_hasta IS NULL OR DATE(fecha_ingreso) <= p_fecha_hasta);
END$$

-- =====================================================
-- PROCEDURE: sp_ordenes_search
-- Búsqueda de texto libre
-- =====================================================
DROP PROCEDURE IF EXISTS sp_ordenes_search$$
CREATE PROCEDURE sp_ordenes_search(
    IN p_query VARCHAR(255),
    IN p_limit INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT 
        o.*,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        v.marca, v.modelo, v.placas,
        e.nombre as estado_nombre,
        e.color as estado_color
    FROM ordenes_servicio o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
    LEFT JOIN estados_orden e ON o.estado_id = e.id
    WHERE 
        o.numero_orden LIKE CONCAT('%', p_query, '%') OR
        c.nombre LIKE CONCAT('%', p_query, '%') OR
        c.telefono LIKE CONCAT('%', p_query, '%') OR
        v.placas LIKE CONCAT('%', p_query, '%') OR
        v.marca LIKE CONCAT('%', p_query, '%') OR
        v.modelo LIKE CONCAT('%', p_query, '%') OR
        o.problema_reportado LIKE CONCAT('%', p_query, '%')
    ORDER BY o.fecha_ingreso DESC
    LIMIT p_limit;
END$$

-- =====================================================
-- PROCEDURE: sp_generate_numero_orden
-- Generar número de orden único
-- =====================================================
DROP PROCEDURE IF EXISTS sp_generate_numero_orden$$
CREATE PROCEDURE sp_generate_numero_orden(
    OUT p_numero_orden VARCHAR(50)
)
BEGIN
    DECLARE v_year VARCHAR(4);
    DECLARE v_last_number INT DEFAULT 0;
    DECLARE v_next_number INT DEFAULT 1;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET v_year = YEAR(NOW());

    -- Obtener el último número del año
    SELECT 
        COALESCE(MAX(CAST(SUBSTRING_INDEX(numero_orden, '-', -1) AS UNSIGNED)), 0)
    INTO v_last_number
    FROM ordenes_servicio 
    WHERE numero_orden LIKE CONCAT('OS-', v_year, '-%');

    SET v_next_number = v_last_number + 1;
    SET p_numero_orden = CONCAT('OS-', v_year, '-', v_next_number);
END$$

-- =====================================================
-- PROCEDURE: sp_orden_get_servicios
-- Obtener servicios de una orden
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_get_servicios$$
CREATE PROCEDURE sp_orden_get_servicios(
    IN p_orden_id INT
)
BEGIN
    SELECT 
        so.*,
        sc.nombre as catalogo_nombre,
        sc.categoria,
        sc.descripcion as catalogo_descripcion
    FROM servicios_orden so
    LEFT JOIN servicios_catalogo sc ON so.servicio_id = sc.id
    WHERE so.orden_id = p_orden_id
    ORDER BY so.id;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_get_refacciones
-- Obtener refacciones de una orden
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_get_refacciones$$
CREATE PROCEDURE sp_orden_get_refacciones(
    IN p_orden_id INT
)
BEGIN
    SELECT *
    FROM refacciones_orden
    WHERE orden_id = p_orden_id
    ORDER BY id;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_get_inspeccion
-- Obtener inspección de una orden
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_get_inspeccion$$
CREATE PROCEDURE sp_orden_get_inspeccion(
    IN p_orden_id INT
)
BEGIN
    SELECT 
        iv.*,
        ei.nombre,
        ei.categoria,
        ei.descripcion,
        ei.es_critico
    FROM inspeccion_vehiculo iv
    LEFT JOIN elementos_inspeccion ei ON iv.elemento_id = ei.id
    WHERE iv.orden_id = p_orden_id
    ORDER BY ei.orden_visual, ei.id;
END$$

-- =====================================================
-- PROCEDURE: sp_orden_get_timeline
-- Obtener timeline de una orden
-- =====================================================
DROP PROCEDURE IF EXISTS sp_orden_get_timeline$$
CREATE PROCEDURE sp_orden_get_timeline(
    IN p_orden_id INT
)
BEGIN
    SELECT 
        ot.*,
        ea.nombre as estado_anterior_nombre,
        ea.color as estado_anterior_color,
        en.nombre as estado_nuevo_nombre,
        en.color as estado_nuevo_color,
        u.nombre_completo as usuario_nombre
    FROM orden_timeline ot
    LEFT JOIN estados_orden ea ON ot.estado_anterior_id = ea.id
    LEFT JOIN estados_orden en ON ot.estado_nuevo_id = en.id
    LEFT JOIN usuarios u ON ot.usuario_id = u.id
    WHERE ot.orden_id = p_orden_id
    ORDER BY ot.created_at DESC;
END$$

DELIMITER ;

-- =====================================================
-- GRANT PERMISSIONS
-- Otorgar permisos de ejecución
-- =====================================================
-- GRANT EXECUTE ON PROCEDURE sp_orden_find_by_id TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_find_by_numero TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_ordenes_list_paginated TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_ordenes_count_filtered TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_create TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_update TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_change_status TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_dashboard_stats TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_ordenes_search TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_generate_numero_orden TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_get_servicios TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_get_refacciones TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_get_inspeccion TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_orden_get_timeline TO 'app_user'@'%';