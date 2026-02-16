-- ============================================================================
-- SAG GARAGE V2.0 - ENTERPRISE DATABASE SCHEMA (IDEMPOTENT VERSION)
-- "BASE DE DATOS DE LOS DIOSES - EDICIÓN IDEMPOTENTE" 
-- ============================================================================
-- Fecha: Febrero 2026
-- Versión: 2.0.0 IDEMPOTENT
-- Autor: SAG Garage Development Team
-- Descripción: Schema 100% re-ejecutable - USUARIOS protegida, todo lo demás se recrea
-- ============================================================================

-- ============================================================================
-- CONFIGURACIÓN INICIAL
-- ============================================================================

-- Desactivar verificaciones para instalación rápida
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET @OLD_TIME_ZONE=@@TIME_ZONE, TIME_ZONE='+00:00';

-- Base de datos creada desde cPanel: saggarag_CotizadorTalleres
USE `saggarag_CotizadorTalleres`;

-- ============================================================================
-- LIMPIEZA SELECTIVA (TODO EXCEPTO USUARIOS)
-- ============================================================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS `v_dashboard_stats`;
DROP VIEW IF EXISTS `v_ordenes_completas`;

-- Eliminar triggers
DROP TRIGGER IF EXISTS `tr_ordenes_audit_insert`;
DROP TRIGGER IF EXISTS `tr_ordenes_audit_update`;
DROP TRIGGER IF EXISTS `tr_ordenes_timeline`;

-- Eliminar stored procedures
DROP PROCEDURE IF EXISTS `GetEstadosSeguridad`;
DROP PROCEDURE IF EXISTS `GetEstadoSeguridadById`;
DROP PROCEDURE IF EXISTS `CreateEstadoSeguridad`;
DROP PROCEDURE IF EXISTS `UpdateEstadoSeguridad`;
DROP PROCEDURE IF EXISTS `GetPuntosSeguridadCatalogo`;
DROP PROCEDURE IF EXISTS `GetPuntoSeguridadById`;
DROP PROCEDURE IF EXISTS `CreatePuntoSeguridad`;
DROP PROCEDURE IF EXISTS `UpdatePuntoSeguridad`;
DROP PROCEDURE IF EXISTS `GetPuntosSeguridadByOrden`;

-- ELIMINAR TODAS LAS TABLAS EXCEPTO USUARIOS (en orden correcto para evitar FK errors)
DROP TABLE IF EXISTS `referidos`;
DROP TABLE IF EXISTS `programa_lealtad`;
DROP TABLE IF EXISTS `solicitudes_resena`;
DROP TABLE IF EXISTS `precios_historicos`;
DROP TABLE IF EXISTS `historial_servicios`;
DROP TABLE IF EXISTS `fallas_comunes`;
DROP TABLE IF EXISTS `fotos_proceso`;
DROP TABLE IF EXISTS `tracking_tokens`;
DROP TABLE IF EXISTS `orden_timeline`;
DROP TABLE IF EXISTS `notificaciones_automaticas`;
DROP TABLE IF EXISTS `plantillas_notificacion`;
DROP TABLE IF EXISTS `orden_puntos_seguridad`;
DROP TABLE IF EXISTS `puntos_seguridad_catalogo`;
DROP TABLE IF EXISTS `refacciones_orden`;
DROP TABLE IF EXISTS `servicios_orden`;
DROP TABLE IF EXISTS `servicios_catalogo`;
DROP TABLE IF EXISTS `inspeccion_vehiculo`;
DROP TABLE IF EXISTS `elementos_inspeccion`;
DROP TABLE IF EXISTS `ordenes_servicio`;
DROP TABLE IF EXISTS `estados_orden`;
DROP TABLE IF EXISTS `vehiculos`;
DROP TABLE IF EXISTS `clientes`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `tipos_negocio`;
DROP TABLE IF EXISTS `configuracion_sistema`;
DROP TABLE IF EXISTS `estados_seguridad`;

-- ⚠️  NOTA IMPORTANTE: USUARIOS NUNCA SE DROPEA - ES SAGRADA ⚠️

-- ============================================================================
-- TABLA: USUARIOS (PROTEGIDA - SOLO SE CREA SI NO EXISTE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(320) NOT NULL COMMENT 'RFC 5322 compliant',
  `password_hash` VARCHAR(255) NOT NULL,
  `nombre_completo` VARCHAR(100) NOT NULL,
  `rol` ENUM('admin','tecnico','recepcionista','owner') NOT NULL DEFAULT 'tecnico',
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `configuracion_json` JSON NULL COMMENT 'Configuración personalizada del usuario',
  `ultimo_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_username` (`username`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `idx_usuarios_rol_activo` (`rol`, `activo`),
  KEY `idx_usuarios_ultimo_login` (`ultimo_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Usuarios del sistema con roles y permisos - TABLA PROTEGIDA';

-- ============================================================================
-- TODAS LAS DEMÁS TABLAS SE RECREAN COMPLETAMENTE
-- ============================================================================

-- ============================================================================
-- TABLA: CLIENTES
-- ============================================================================

CREATE TABLE `clientes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NULL,
  `email` VARCHAR(320) NULL,
  `direccion` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_clientes_nombre` (`nombre`),
  KEY `idx_clientes_telefono` (`telefono`),
  KEY `idx_clientes_email` (`email`),
  FULLTEXT KEY `ft_clientes_busqueda` (`nombre`, `telefono`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Clientes del sistema - información básica';

-- ============================================================================
-- TABLA: VEHICULOS
-- ============================================================================

CREATE TABLE `vehiculos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` INT UNSIGNED NOT NULL,
  `marca` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(50) NOT NULL,
  `anio` YEAR NULL,
  `color` VARCHAR(30) NULL,
  `placas` VARCHAR(20) NULL,
  `niv` VARCHAR(50) NULL COMMENT 'Número de identificación vehicular',
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_vehiculos_cliente` (`cliente_id`),
  KEY `idx_vehiculos_placas` (`placas`),
  KEY `idx_vehiculos_marca_modelo` (`marca`, `modelo`),
  UNIQUE KEY `uk_vehiculos_placas` (`placas`),
  FULLTEXT KEY `ft_vehiculos_busqueda` (`marca`, `modelo`, `placas`),
  
  CONSTRAINT `fk_vehiculos_cliente` 
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Vehículos asociados a clientes';

-- ============================================================================
-- TABLA: ESTADOS_ORDEN
-- ============================================================================

CREATE TABLE `estados_orden` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `color` VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  `descripcion` VARCHAR(200) NULL,
  `workflow_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `requiere_aprobacion` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `auto_notification` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_estados_nombre` (`nombre`),
  KEY `idx_estados_workflow` (`workflow_order`, `activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Estados de workflow para órdenes de servicio';

-- ============================================================================
-- TABLA: ORDENES_SERVICIO
-- ============================================================================

CREATE TABLE `ordenes_servicio` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_orden` VARCHAR(20) NOT NULL,
  `cliente_id` INT UNSIGNED NOT NULL,
  `vehiculo_id` INT UNSIGNED NOT NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `problema_reportado` TEXT NOT NULL,
  `diagnostico` TEXT NULL,
  `estado_id` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `prioridad` ENUM('baja','normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `kilometraje_entrada` VARCHAR(20) NULL,
  `kilometraje_salida` VARCHAR(20) NULL,
  `nivel_combustible` DECIMAL(5,2) UNSIGNED NULL DEFAULT 0.00,
  `subtotal` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `descuento` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `iva_porcentaje` DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 16.00,
  `iva_monto` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `anticipo` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `fecha_ingreso` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_promesa` TIMESTAMP NULL,
  `fecha_completado` TIMESTAMP NULL,
  `fecha_entregado` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ordenes_numero` (`numero_orden`),
  KEY `idx_ordenes_cliente_fecha` (`cliente_id`, `fecha_ingreso` DESC),
  KEY `idx_ordenes_vehiculo` (`vehiculo_id`),
  KEY `idx_ordenes_usuario` (`usuario_id`),
  KEY `idx_ordenes_estado` (`estado_id`),
  KEY `idx_ordenes_prioridad` (`prioridad`),
  KEY `idx_ordenes_fecha_promesa` (`fecha_promesa`),
  FULLTEXT KEY `ft_ordenes_busqueda` (`numero_orden`, `problema_reportado`, `diagnostico`),
  
  CONSTRAINT `fk_ordenes_cliente` 
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ordenes_vehiculo` 
    FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ordenes_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ordenes_estado` 
    FOREIGN KEY (`estado_id`) REFERENCES `estados_orden` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Órdenes de servicio - core business table';

-- ============================================================================
-- TABLA: ELEMENTOS_INSPECCION
-- ============================================================================

CREATE TABLE `elementos_inspeccion` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `obligatorio` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `orden_visual` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_elementos_categoria` (`categoria`, `orden_visual`),
  KEY `idx_elementos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Catálogo de elementos para inspección de vehículos';

-- ============================================================================
-- TABLA: ESTADOS_SEGURIDAD
-- ============================================================================

CREATE TABLE `estados_seguridad` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL,
  `color` VARCHAR(7) NOT NULL DEFAULT '#6c757d',
  `icon` VARCHAR(50) NOT NULL DEFAULT 'circle',
  `orden_visualizacion` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_estados_seguridad_nombre` (`nombre`),
  KEY `idx_estados_seguridad_orden` (`orden_visualizacion`, `activo`),
  KEY `idx_estados_seguridad_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Estados de seguridad para puntos de inspección';

-- ============================================================================
-- TABLA: INSPECCION_VEHICULO
-- ============================================================================

CREATE TABLE `inspeccion_vehiculo` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `elemento_id` SMALLINT UNSIGNED NOT NULL,
  `tiene_elemento` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `observaciones` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inspeccion_orden_elemento` (`orden_id`, `elemento_id`),
  KEY `idx_inspeccion_elemento` (`elemento_id`),
  
  CONSTRAINT `fk_inspeccion_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inspeccion_elemento` 
    FOREIGN KEY (`elemento_id`) REFERENCES `elementos_inspeccion` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Inspección de vehículos - sistema flexible sin checkboxes hardcoded';

-- ============================================================================
-- TABLA: SERVICIOS_CATALOGO
-- ============================================================================

CREATE TABLE `servicios_catalogo` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `categoria` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `precio_base` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `tiempo_estimado_horas` DECIMAL(4,2) UNSIGNED NULL,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_servicios_categoria` (`categoria`),
  KEY `idx_servicios_activo` (`activo`),
  FULLTEXT KEY `ft_servicios_busqueda` (`nombre`, `descripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Catálogo de servicios predefinidos';

-- ============================================================================
-- TABLA: SERVICIOS_ORDEN
-- ============================================================================

CREATE TABLE `servicios_orden` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `servicio_id` SMALLINT UNSIGNED NULL COMMENT 'NULL si es servicio custom',
  `descripcion` VARCHAR(500) NOT NULL,
  `precio_unitario` DECIMAL(10,2) UNSIGNED NOT NULL,
  `cantidad` DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT 1.00,
  `descuento` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_servicios_orden_orden` (`orden_id`),
  KEY `idx_servicios_orden_servicio` (`servicio_id`),
  
  CONSTRAINT `fk_servicios_orden_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_servicios_orden_servicio` 
    FOREIGN KEY (`servicio_id`) REFERENCES `servicios_catalogo` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Servicios aplicados a cada orden';

-- ============================================================================
-- TABLA: REFACCIONES_ORDEN
-- ============================================================================

CREATE TABLE `refacciones_orden` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `descripcion` VARCHAR(500) NOT NULL,
  `numero_parte` VARCHAR(100) NULL,
  `cantidad` DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT 1.00,
  `precio_unitario` DECIMAL(10,2) UNSIGNED NOT NULL,
  `margen_porcentaje` DECIMAL(5,2) UNSIGNED NULL DEFAULT 0.00,
  `proveedor` VARCHAR(200) NULL,
  `subtotal` DECIMAL(10,2) UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_refacciones_orden` (`orden_id`),
  KEY `idx_refacciones_numero_parte` (`numero_parte`),
  KEY `idx_refacciones_proveedor` (`proveedor`),
  
  CONSTRAINT `fk_refacciones_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Refacciones utilizadas en cada orden';

-- ============================================================================
-- TABLA: PUNTOS_SEGURIDAD_CATALOGO
-- ============================================================================

CREATE TABLE `puntos_seguridad_catalogo` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL,
  `orden_visualizacion` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `es_critico` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_puntos_categoria` (`categoria`, `orden_visualizacion`),
  KEY `idx_puntos_critico` (`es_critico`),
  KEY `idx_puntos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Catálogo de puntos de seguridad para inspección vehicular';

-- ============================================================================
-- TABLA: ORDEN_PUNTOS_SEGURIDAD
-- ============================================================================

CREATE TABLE `orden_puntos_seguridad` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `punto_seguridad_id` SMALLINT UNSIGNED NOT NULL,
  `estado_id` SMALLINT UNSIGNED NOT NULL,
  `notas` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orden_punto` (`orden_id`, `punto_seguridad_id`),
  KEY `idx_orden_puntos_orden` (`orden_id`),
  KEY `idx_orden_puntos_punto` (`punto_seguridad_id`),
  KEY `idx_orden_puntos_estado` (`estado_id`),
  
  CONSTRAINT `fk_orden_puntos_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_puntos_punto` 
    FOREIGN KEY (`punto_seguridad_id`) REFERENCES `puntos_seguridad_catalogo` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_puntos_estado` 
    FOREIGN KEY (`estado_id`) REFERENCES `estados_seguridad` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Puntos de seguridad evaluados por orden de servicio';

-- ============================================================================
-- TABLAS DE AUTOMATIZACIÓN Y NOTIFICACIONES
-- ============================================================================

CREATE TABLE `plantillas_notificacion` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo_evento` VARCHAR(50) NOT NULL,
  `canal` ENUM('whatsapp','email','sms') NOT NULL,
  `titulo` VARCHAR(200) NULL,
  `mensaje` TEXT NOT NULL,
  `variables_disponibles` JSON NULL COMMENT 'Variables que se pueden usar en el template',
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_plantillas_tipo_canal` (`tipo_evento`, `canal`),
  KEY `idx_plantillas_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Plantillas para notificaciones automáticas';

CREATE TABLE `notificaciones_automaticas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `plantilla_id` SMALLINT UNSIGNED NOT NULL,
  `destinatario_telefono` VARCHAR(20) NULL,
  `destinatario_email` VARCHAR(320) NULL,
  `mensaje_final` TEXT NOT NULL,
  `programada_para` TIMESTAMP NOT NULL,
  `enviada` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `fecha_envio` TIMESTAMP NULL,
  `resultado` ENUM('pendiente','enviado','fallido','cancelado') NOT NULL DEFAULT 'pendiente',
  `metadata_json` JSON NULL COMMENT 'Metadata del envío',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_orden` (`orden_id`),
  KEY `idx_notificaciones_plantilla` (`plantilla_id`),
  KEY `idx_notificaciones_programada` (`programada_para`, `resultado`),
  KEY `idx_notificaciones_resultado` (`resultado`),
  
  CONSTRAINT `fk_notificaciones_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notificaciones_plantilla` 
    FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_notificacion` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Cola de notificaciones automáticas';

-- ============================================================================
-- TABLAS DE CUSTOMER JOURNEY Y PORTAL
-- ============================================================================

CREATE TABLE `orden_timeline` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `estado_anterior_id` SMALLINT UNSIGNED NULL,
  `estado_nuevo_id` SMALLINT UNSIGNED NOT NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `notas` VARCHAR(500) NULL,
  `foto_url` VARCHAR(500) NULL,
  `notificacion_enviada` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_timeline_orden` (`orden_id`, `created_at` DESC),
  KEY `idx_timeline_usuario` (`usuario_id`),
  KEY `idx_timeline_estado_nuevo` (`estado_nuevo_id`),
  
  CONSTRAINT `fk_timeline_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_timeline_estado_anterior` 
    FOREIGN KEY (`estado_anterior_id`) REFERENCES `estados_orden` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_timeline_estado_nuevo` 
    FOREIGN KEY (`estado_nuevo_id`) REFERENCES `estados_orden` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_timeline_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Timeline de cambios de estado por orden';

CREATE TABLE `tracking_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `expira_en` TIMESTAMP NOT NULL,
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tokens_token` (`token`),
  KEY `idx_tokens_orden` (`orden_id`),
  KEY `idx_tokens_expira` (`expira_en`, `activo`),
  
  CONSTRAINT `fk_tokens_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Tokens para tracking público de órdenes';

CREATE TABLE `fotos_proceso` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `etapa` VARCHAR(50) NOT NULL,
  `foto_url` VARCHAR(500) NOT NULL,
  `descripcion` VARCHAR(200) NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_fotos_orden` (`orden_id`, `created_at` DESC),
  KEY `idx_fotos_etapa` (`etapa`),
  KEY `idx_fotos_usuario` (`usuario_id`),
  
  CONSTRAINT `fk_fotos_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fotos_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Fotos del proceso para portal del cliente';

-- ============================================================================
-- TABLAS DE INTELIGENCIA PREDICTIVA
-- ============================================================================

CREATE TABLE `fallas_comunes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `marca` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(50) NOT NULL,
  `anio_inicio` YEAR NULL,
  `anio_fin` YEAR NULL,
  `componente` VARCHAR(100) NOT NULL,
  `sintoma` VARCHAR(500) NOT NULL,
  `solucion_comun` TEXT NULL,
  `precio_estimado_min` DECIMAL(10,2) UNSIGNED NULL,
  `precio_estimado_max` DECIMAL(10,2) UNSIGNED NULL,
  `frecuencia_ocurrencia` DECIMAL(5,2) UNSIGNED NULL COMMENT 'Porcentaje de ocurrencia',
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_fallas_marca_modelo` (`marca`, `modelo`),
  KEY `idx_fallas_componente` (`componente`),
  KEY `idx_fallas_anios` (`anio_inicio`, `anio_fin`),
  FULLTEXT KEY `ft_fallas_sintoma` (`sintoma`, `solucion_comun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Base de conocimiento de fallas comunes por vehículo';

CREATE TABLE `historial_servicios` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehiculo_id` INT UNSIGNED NOT NULL,
  `orden_id` INT UNSIGNED NOT NULL,
  `tipo_servicio` VARCHAR(100) NOT NULL,
  `kilometraje` VARCHAR(20) NULL,
  `costo_total` DECIMAL(10,2) UNSIGNED NOT NULL,
  `fecha_servicio` TIMESTAMP NOT NULL,
  `proxima_recomendacion_km` VARCHAR(20) NULL,
  `proxima_recomendacion_fecha` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_historial_vehiculo` (`vehiculo_id`, `fecha_servicio` DESC),
  KEY `idx_historial_orden` (`orden_id`),
  KEY `idx_historial_tipo` (`tipo_servicio`),
  KEY `idx_historial_proxima_fecha` (`proxima_recomendacion_fecha`),
  
  CONSTRAINT `fk_historial_vehiculo` 
    FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Historial de servicios para predicciones de mantenimiento';

CREATE TABLE `precios_historicos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servicio_nombre` VARCHAR(200) NOT NULL,
  `marca` VARCHAR(50) NULL,
  `modelo` VARCHAR(50) NULL,
  `precio_min` DECIMAL(10,2) UNSIGNED NOT NULL,
  `precio_max` DECIMAL(10,2) UNSIGNED NOT NULL,
  `precio_promedio` DECIMAL(10,2) UNSIGNED NOT NULL,
  `precio_sugerido` DECIMAL(10,2) UNSIGNED NOT NULL,
  `cantidad_ordenes` INT UNSIGNED NOT NULL DEFAULT 0,
  `fecha_calculo` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_precios_servicio` (`servicio_nombre`, `fecha_calculo` DESC),
  KEY `idx_precios_marca_modelo` (`marca`, `modelo`),
  KEY `idx_precios_fecha` (`fecha_calculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Precios históricos para sugerencias inteligentes';

-- ============================================================================
-- TABLAS DE SISTEMA DE REPUTACIÓN
-- ============================================================================

CREATE TABLE `solicitudes_resena` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_id` INT UNSIGNED NOT NULL,
  `cliente_id` INT UNSIGNED NOT NULL,
  `link_google` VARCHAR(500) NULL,
  `enviada_fecha` TIMESTAMP NULL,
  `respondida_fecha` TIMESTAMP NULL,
  `calificacion` TINYINT UNSIGNED NULL COMMENT '1-5 estrellas',
  `comentario` TEXT NULL,
  `plataforma` ENUM('google','facebook','interno') NOT NULL DEFAULT 'google',
  `estado` ENUM('pendiente','enviado','respondido','expirado') NOT NULL DEFAULT 'pendiente',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resena_orden` (`orden_id`),
  KEY `idx_resena_cliente` (`cliente_id`),
  KEY `idx_resena_estado` (`estado`),
  KEY `idx_resena_calificacion` (`calificacion`),
  
  CONSTRAINT `fk_resena_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resena_cliente` 
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Sistema de solicitudes de reseñas automáticas';

CREATE TABLE `programa_lealtad` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` INT UNSIGNED NOT NULL,
  `puntos_acumulados` INT UNSIGNED NOT NULL DEFAULT 0,
  `nivel` ENUM('bronce','plata','oro','platino') NOT NULL DEFAULT 'bronce',
  `descuento_actual` DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `fecha_ultimo_servicio` TIMESTAMP NULL,
  `servicios_completados` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `total_gastado` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lealtad_cliente` (`cliente_id`),
  KEY `idx_lealtad_nivel` (`nivel`),
  KEY `idx_lealtad_ultimo_servicio` (`fecha_ultimo_servicio`),
  
  CONSTRAINT `fk_lealtad_cliente` 
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Programa de lealtad para clientes frecuentes';

CREATE TABLE `referidos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_referidor_id` INT UNSIGNED NOT NULL,
  `cliente_referido_id` INT UNSIGNED NOT NULL,
  `orden_id` INT UNSIGNED NOT NULL COMMENT 'Orden que activó el referido',
  `descuento_referidor` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `descuento_referido` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `estado` ENUM('pendiente','aplicado','expirado') NOT NULL DEFAULT 'pendiente',
  `fecha_referido` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_aplicado` TIMESTAMP NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_referidos_referidor` (`cliente_referidor_id`),
  KEY `idx_referidos_referido` (`cliente_referido_id`),
  KEY `idx_referidos_orden` (`orden_id`),
  KEY `idx_referidos_estado` (`estado`),
  
  CONSTRAINT `fk_referidos_referidor` 
    FOREIGN KEY (`cliente_referidor_id`) REFERENCES `clientes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_referidos_referido` 
    FOREIGN KEY (`cliente_referido_id`) REFERENCES `clientes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_referidos_orden` 
    FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Sistema de referidos entre clientes';

-- ============================================================================
-- TABLAS DE CONFIGURACIÓN Y CATÁLOGOS
-- ============================================================================

CREATE TABLE `configuracion_sistema` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(100) NOT NULL,
  `valor` TEXT NULL,
  `tipo_dato` ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
  `descripcion` VARCHAR(500) NULL,
  `categoria` VARCHAR(50) NOT NULL DEFAULT 'general',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_clave` (`clave`),
  KEY `idx_config_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Configuración general del sistema';

CREATE TABLE `tipos_negocio` (
  `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL,
  `configuracion_json` JSON NULL COMMENT 'Configuración específica del tipo de negocio',
  `plantillas_inspeccion` JSON NULL COMMENT 'Elementos de inspección personalizados',
  `workflows_estados` JSON NULL COMMENT 'Estados de workflow personalizados',
  `activo` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tipos_slug` (`slug`),
  KEY `idx_tipos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Tipos de negocio para sistema multi-industria';

-- ============================================================================
-- TABLA DE AUDITORÍA
-- ============================================================================

CREATE TABLE `audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tabla` VARCHAR(100) NOT NULL,
  `registro_id` INT UNSIGNED NOT NULL,
  `usuario_id` INT UNSIGNED NULL,
  `accion` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `valores_anteriores` JSON NULL,
  `valores_nuevos` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_audit_tabla_registro` (`tabla`, `registro_id`),
  KEY `idx_audit_usuario` (`usuario_id`),
  KEY `idx_audit_fecha` (`created_at`),
  KEY `idx_audit_accion` (`accion`),
  
  CONSTRAINT `fk_audit_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Log de auditoría para tracking de cambios';

-- ============================================================================
-- DATOS INICIALES (INSERT IGNORE PARA IDEMPOTENCIA)
-- ============================================================================

-- Estados de orden básicos (INSERT IGNORE para no duplicar)
INSERT IGNORE INTO `estados_orden` (`id`, `nombre`, `color`, `descripcion`, `workflow_order`, `requiere_aprobacion`, `auto_notification`) VALUES
(1, 'Recibido', '#6B7280', 'Orden recién ingresada al sistema', 1, 0, 1),
(2, 'En Diagnóstico', '#3B82F6', 'Vehículo en proceso de diagnóstico', 2, 0, 1),
(3, 'Cotización Lista', '#F59E0B', 'Cotización preparada, esperando aprobación', 3, 1, 1),
(4, 'Aprobado', '#10B981', 'Cliente aprobó la cotización', 4, 0, 1),
(5, 'En Trabajo', '#8B5CF6', 'Reparación/servicio en proceso', 5, 0, 1),
(6, 'Esperando Refacciones', '#F97316', 'Trabajo pausado esperando partes', 6, 0, 1),
(7, 'En Pruebas', '#06B6D4', 'Vehículo en pruebas finales', 7, 0, 1),
(8, 'Listo para Entrega', '#22C55E', 'Trabajo completado, listo para cliente', 8, 0, 1),
(9, 'Entregado', '#059669', 'Vehículo entregado al cliente', 9, 0, 1),
(10, 'Cancelado', '#EF4444', 'Orden cancelada', 99, 1, 1);

-- Elementos de inspección básicos (INSERT IGNORE)
INSERT IGNORE INTO `elementos_inspeccion` (`id`, `nombre`, `categoria`, `obligatorio`, `orden_visual`) VALUES
(1, 'Luces Frontales', 'Exteriores', 1, 1),
(2, 'Cuarto de Luces', 'Exteriores', 1, 2),
(3, 'Antena', 'Exteriores', 0, 3),
(4, 'Espejos Laterales', 'Exteriores', 1, 4),
(5, 'Cristales', 'Exteriores', 1, 5),
(6, 'Emblemas', 'Exteriores', 0, 6),
(7, 'Llantas', 'Exteriores', 1, 7),
(8, 'Llanta de Refacción', 'Exteriores', 0, 8),
(9, 'Tapón de Ruedas', 'Exteriores', 0, 9),
(10, 'Molduras', 'Exteriores', 0, 10),
(11, 'Tapón de Gasolina', 'Exteriores', 1, 11),
(12, 'Limpiadores', 'Exteriores', 1, 12),
(13, 'Gato', 'Herramientas', 0, 13),
(14, 'Herramienta', 'Herramientas', 0, 14),
(15, 'Extinguidor', 'Seguridad', 0, 15),
(16, 'Instrumentos del Tablero', 'Interiores', 1, 16),
(17, 'Calefacción', 'Interiores', 1, 17),
(18, 'Sistema de Sonido', 'Interiores', 0, 18),
(19, 'Bocinas', 'Interiores', 0, 19),
(20, 'Espejo Retrovisor', 'Interiores', 1, 20),
(21, 'Cinturones de Seguridad', 'Interiores', 1, 21),
(22, 'Botonería General', 'Interiores', 1, 22),
(23, 'Manijas', 'Interiores', 1, 23),
(24, 'Tapetes', 'Interiores', 0, 24),
(25, 'Vestiduras', 'Interiores', 1, 25),
(26, 'Radio', 'Interiores', 0, 26),
(27, 'Encendedor', 'Interiores', 0, 27),
(28, 'Documentos', 'Documentación', 0, 28);

-- Estados de seguridad básicos (INSERT IGNORE)
INSERT IGNORE INTO `estados_seguridad` (`id`, `nombre`, `descripcion`, `color`, `icon`, `orden_visualizacion`) VALUES
(1, 'Excelente', 'Componente en perfecto estado', '#28a745', 'check-circle', 1),
(2, 'Bueno', 'Componente en buen estado', '#17a2b8', 'check', 2),
(3, 'Regular', 'Componente necesita atención', '#ffc107', 'exclamation-triangle', 3),
(4, 'Malo', 'Componente necesita reparación urgente', '#fd7e14', 'exclamation', 4),
(5, 'Crítico', 'Componente debe ser reemplazado inmediatamente', '#dc3545', 'times-circle', 5),
(6, 'No Aplica', 'No aplica para este vehículo', '#6c757d', 'minus', 6);

-- Puntos de seguridad del catálogo (INSERT IGNORE)
INSERT IGNORE INTO `puntos_seguridad_catalogo` (`id`, `nombre`, `categoria`, `descripcion`, `orden_visualizacion`, `es_critico`) VALUES
-- Sistema de Frenos (Críticos)
(1, 'Pastillas de Freno Delanteras', 'Frenos', 'Estado de las pastillas/balatas delanteras', 1, 1),
(2, 'Pastillas de Freno Traseras', 'Frenos', 'Estado de las pastillas/balatas traseras', 2, 1),
(3, 'Discos de Freno Delanteros', 'Frenos', 'Condición de los discos de freno delanteros', 3, 1),
(4, 'Discos de Freno Traseros', 'Frenos', 'Condición de los discos de freno traseros', 4, 1),
(5, 'Líquido de Frenos', 'Frenos', 'Nivel y calidad del líquido de frenos', 5, 1),
(6, 'Pedal de Freno', 'Frenos', 'Funcionamiento y sensación del pedal', 6, 1),
(7, 'Freno de Mano', 'Frenos', 'Funcionamiento del freno de estacionamiento', 7, 1),

-- Sistema de Suspensión (Críticos)
(8, 'Amortiguadores Delanteros', 'Suspensión', 'Estado de amortiguadores delanteros', 8, 1),
(9, 'Amortiguadores Traseros', 'Suspensión', 'Estado de amortiguadores traseros', 9, 1),
(10, 'Resortes Delanteros', 'Suspensión', 'Condición de resortes delanteros', 10, 1),
(11, 'Resortes Traseros', 'Suspensión', 'Condición de resortes traseros', 11, 1),
(12, 'Rotulas', 'Suspensión', 'Estado de las rótulas de suspensión', 12, 1),
(13, 'Terminales de Dirección', 'Suspensión', 'Condición de terminales de dirección', 13, 1),

-- Llantas y Neumáticos (Críticos)
(14, 'Llanta Delantera Izquierda', 'Neumáticos', 'Estado del neumático delantero izquierdo', 14, 1),
(15, 'Llanta Delantera Derecha', 'Neumáticos', 'Estado del neumático delantero derecho', 15, 1),
(16, 'Llanta Trasera Izquierda', 'Neumáticos', 'Estado del neumático trasero izquierdo', 16, 1),
(17, 'Llanta Trasera Derecha', 'Neumáticos', 'Estado del neumático trasero derecho', 17, 1),
(18, 'Llanta de Refacción', 'Neumáticos', 'Estado de la llanta de repuesto', 18, 0),
(19, 'Alineación', 'Neumáticos', 'Estado de la alineación del vehículo', 19, 1),
(20, 'Balanceo', 'Neumáticos', 'Balanceo de las ruedas', 20, 1),

-- Sistema de Luces (Críticos para seguridad vial)
(21, 'Faros Delanteros', 'Luces', 'Funcionamiento de faros principales', 21, 1),
(22, 'Luces Traseras', 'Luces', 'Funcionamiento de luces traseras', 22, 1),
(23, 'Intermitentes', 'Luces', 'Funcionamiento de direccionales', 23, 1),
(24, 'Luces de Freno', 'Luces', 'Funcionamiento de luces de stop', 24, 1),
(25, 'Luces de Reversa', 'Luces', 'Funcionamiento de luces de reversa', 25, 0),
(26, 'Faros Antiniebla', 'Luces', 'Funcionamiento de faros antiniebla', 26, 0),

-- Motor y Transmisión
(27, 'Aceite de Motor', 'Motor', 'Nivel y calidad del aceite de motor', 27, 1),
(28, 'Filtro de Aceite', 'Motor', 'Condición del filtro de aceite', 28, 1),
(29, 'Filtro de Aire', 'Motor', 'Estado del filtro de aire del motor', 29, 0),
(30, 'Correas y Bandas', 'Motor', 'Estado de correas del motor', 30, 1),
(31, 'Mangueras del Motor', 'Motor', 'Condición de mangueras del sistema', 31, 1),
(32, 'Baterías', 'Motor', 'Estado de la batería del vehículo', 32, 1),
(33, 'Alternador', 'Motor', 'Funcionamiento del alternador', 33, 1),
(34, 'Marcha/Motor de Arranque', 'Motor', 'Funcionamiento del motor de arranque', 34, 1),

-- Fluidos del Vehículo
(35, 'Líquido de Transmisión', 'Fluidos', 'Nivel y calidad del ATF', 35, 1),
(36, 'Líquido de Dirección', 'Fluidos', 'Nivel del líquido hidráulico', 36, 1),
(37, 'Refrigerante', 'Fluidos', 'Nivel y calidad del anticongelante', 37, 1),
(38, 'Líquido Limpiaparabrisas', 'Fluidos', 'Nivel del líquido lavaparabrisas', 38, 0),

-- Escape y Emisiones
(39, 'Sistema de Escape', 'Escape', 'Condición del sistema de escape', 39, 1),
(40, 'Catalizador', 'Escape', 'Funcionamiento del convertidor catalítico', 40, 1),
(41, 'Sensor de Oxígeno', 'Escape', 'Estado de sondas lambda', 41, 0),

-- Carrocería y Exteriores
(42, 'Parabrisas', 'Carrocería', 'Estado del cristal frontal', 42, 1),
(43, 'Espejos Retrovisores', 'Carrocería', 'Condición de espejos', 43, 1),
(44, 'Limpiaparabrisas', 'Carrocería', 'Funcionamiento de plumillas', 44, 1),
(45, 'Puertas', 'Carrocería', 'Funcionamiento de puertas', 45, 0),
(46, 'Ventanas', 'Carrocería', 'Estado de cristales laterales', 46, 0),

-- Seguridad Interior
(47, 'Cinturones de Seguridad', 'Seguridad', 'Funcionamiento de cinturones', 47, 1),
(48, 'Airbags', 'Seguridad', 'Sistema de bolsas de aire', 48, 1),
(49, 'Bocina/Claxon', 'Seguridad', 'Funcionamiento de la bocina', 49, 1),

-- Aires Acondicionado y Confort
(50, 'Sistema A/C', 'Confort', 'Funcionamiento del aire acondicionado', 50, 0),
(51, 'Calefacción', 'Confort', 'Sistema de calefacción', 51, 0),
(52, 'Filtro de Cabina', 'Confort', 'Estado del filtro del A/C', 52, 0);

-- Servicios básicos del catálogo (INSERT IGNORE)
INSERT IGNORE INTO `servicios_catalogo` (`id`, `nombre`, `categoria`, `descripcion`, `precio_base`, `tiempo_estimado_horas`) VALUES
(1, 'Cambio de Aceite y Filtro', 'Mantenimiento', 'Cambio de aceite de motor y filtro de aceite', 350.00, 0.50),
(2, 'Afinación Menor', 'Mantenimiento', 'Cambio de bujías, filtros básicos', 800.00, 2.00),
(3, 'Afinación Mayor', 'Mantenimiento', 'Afinación completa con cambio de componentes', 1500.00, 4.00),
(4, 'Servicio de Frenos Delanteros', 'Frenos', 'Cambio de balatas delanteras', 750.00, 1.50),
(5, 'Servicio de Frenos Traseros', 'Frenos', 'Cambio de balatas traseras', 650.00, 1.00),
(6, 'Alineación y Balanceo', 'Llantas', 'Alineación de dirección y balanceo de llantas', 500.00, 1.00),
(7, 'Diagnóstico Computarizado', 'Diagnóstico', 'Escaneo completo del vehículo', 200.00, 0.50),
(8, 'Cambio de Batería', 'Eléctrico', 'Instalación de batería nueva', 100.00, 0.25),
(9, 'Servicio de Suspensión', 'Suspensión', 'Revisión y reparación de suspensión', 1200.00, 3.00),
(10, 'Servicio de Aire Acondicionado', 'Clima', 'Mantenimiento de sistema A/C', 800.00, 2.00);

-- Configuración inicial del sistema (INSERT IGNORE)
INSERT IGNORE INTO `configuracion_sistema` (`id`, `clave`, `valor`, `tipo_dato`, `descripcion`, `categoria`) VALUES
(1, 'iva_porcentaje', '16.00', 'number', 'Porcentaje de IVA por defecto', 'facturacion'),
(2, 'nombre_empresa', 'SAG GARAGE', 'string', 'Nombre de la empresa', 'empresa'),
(3, 'telefono_empresa', '', 'string', 'Teléfono principal de la empresa', 'empresa'),
(4, 'email_empresa', 'contacto@saggarage.com', 'string', 'Email principal de la empresa', 'empresa'),
(5, 'direccion_empresa', '', 'string', 'Dirección de la empresa', 'empresa'),
(6, 'formato_numero_orden', 'OS-{YEAR}-{ID}', 'string', 'Formato para números de orden', 'ordenes'),
(7, 'garantia_dias_default', '30', 'number', 'Días de garantía por defecto', 'garantias'),
(8, 'whatsapp_api_enabled', 'false', 'boolean', 'Habilitar notificaciones por WhatsApp', 'notificaciones'),
(9, 'portal_cliente_enabled', 'true', 'boolean', 'Habilitar portal público del cliente', 'portal'),
(10, 'programa_lealtad_enabled', 'true', 'boolean', 'Habilitar programa de lealtad', 'lealtad');

-- Tipo de negocio inicial (INSERT IGNORE)
INSERT IGNORE INTO `tipos_negocio` (`id`, `nombre`, `slug`, `descripcion`, `configuracion_json`) VALUES
(1, 'Taller Mecánico', 'taller-mecanico', 'Taller de reparación y mantenimiento automotriz', 
JSON_OBJECT(
    'requiere_vehiculo', true,
    'maneja_refacciones', true,
    'usa_diagnostico', true,
    'servicios_principales', JSON_ARRAY('afinacion', 'frenos', 'suspension', 'diagnostico'),
    'campos_adicionales', JSON_OBJECT(
        'kilometraje', true,
        'nivel_combustible', true,
        'inspeccion_visual', true
    )
));

-- ============================================================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================================================

DELIMITER $$

-- Trigger para auditoría de órdenes
CREATE TRIGGER `tr_ordenes_audit_insert` 
    AFTER INSERT ON `ordenes_servicio`
    FOR EACH ROW
BEGIN
    INSERT INTO `audit_log` (`tabla`, `registro_id`, `usuario_id`, `accion`, `valores_nuevos`)
    VALUES ('ordenes_servicio', NEW.id, NEW.usuario_id, 'INSERT', 
            JSON_OBJECT('numero_orden', NEW.numero_orden, 'cliente_id', NEW.cliente_id, 
                       'estado_id', NEW.estado_id, 'total', NEW.total));
END$$

CREATE TRIGGER `tr_ordenes_audit_update` 
    AFTER UPDATE ON `ordenes_servicio`
    FOR EACH ROW
BEGIN
    INSERT INTO `audit_log` (`tabla`, `registro_id`, `usuario_id`, `accion`, `valores_anteriores`, `valores_nuevos`)
    VALUES ('ordenes_servicio', NEW.id, NEW.usuario_id, 'UPDATE',
            JSON_OBJECT('estado_id', OLD.estado_id, 'total', OLD.total, 'anticipo', OLD.anticipo),
            JSON_OBJECT('estado_id', NEW.estado_id, 'total', NEW.total, 'anticipo', NEW.anticipo));
END$$

-- Trigger para timeline automático
CREATE TRIGGER `tr_ordenes_timeline` 
    AFTER UPDATE ON `ordenes_servicio`
    FOR EACH ROW
BEGIN
    IF OLD.estado_id != NEW.estado_id THEN
        INSERT INTO `orden_timeline` (`orden_id`, `estado_anterior_id`, `estado_nuevo_id`, `usuario_id`)
        VALUES (NEW.id, OLD.estado_id, NEW.estado_id, NEW.usuario_id);
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- STORED PROCEDURES PARA ESTADOS_SEGURIDAD
-- ============================================================================

DELIMITER $$

-- Obtener todos los estados de seguridad
CREATE PROCEDURE GetEstadosSeguridad()
BEGIN
    SELECT 
        id,
        nombre,
        descripcion,
        color,
        icon,
        orden_visualizacion,
        activo,
        created_at,
        updated_at
    FROM estados_seguridad 
    WHERE activo = 1
    ORDER BY orden_visualizacion ASC, nombre ASC;
END$$

-- Obtener estado de seguridad por ID
CREATE PROCEDURE GetEstadoSeguridadById(IN estado_id INT)
BEGIN
    SELECT 
        id,
        nombre,
        descripcion,
        color,
        icon,
        orden_visualizacion,
        activo,
        created_at,
        updated_at
    FROM estados_seguridad 
    WHERE id = estado_id AND activo = 1;
END$$

-- Crear estado de seguridad
CREATE PROCEDURE CreateEstadoSeguridad(
    IN p_nombre VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_color VARCHAR(7),
    IN p_icon VARCHAR(50),
    IN p_orden_visualizacion TINYINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO estados_seguridad (nombre, descripcion, color, icon, orden_visualizacion, activo)
    VALUES (p_nombre, p_descripcion, p_color, p_icon, p_orden_visualizacion, 1);
    
    SELECT LAST_INSERT_ID() as id, 'Estado de seguridad creado exitosamente' as message;
    
    COMMIT;
END$$

-- Actualizar estado de seguridad
CREATE PROCEDURE UpdateEstadoSeguridad(
    IN p_id INT,
    IN p_nombre VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_color VARCHAR(7),
    IN p_icon VARCHAR(50),
    IN p_orden_visualizacion TINYINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE estados_seguridad 
    SET 
        nombre = p_nombre,
        descripcion = p_descripcion,
        color = p_color,
        icon = p_icon,
        orden_visualizacion = p_orden_visualizacion,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id AND activo = 1;
    
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de seguridad no encontrado';
    END IF;
    
    SELECT p_id as id, 'Estado de seguridad actualizado exitosamente' as message;
    
    COMMIT;
END$$

-- ============================================================================
-- STORED PROCEDURES PARA PUNTOS_SEGURIDAD_CATALOGO
-- ============================================================================

-- Obtener todos los puntos de seguridad del catálogo
CREATE PROCEDURE GetPuntosSeguridadCatalogo()
BEGIN
    SELECT 
        id,
        nombre,
        categoria,
        descripcion,
        orden_visualizacion,
        es_critico,
        activo,
        created_at,
        updated_at
    FROM puntos_seguridad_catalogo 
    WHERE activo = 1
    ORDER BY orden_visualizacion ASC, nombre ASC;
END$$

-- Obtener punto de seguridad por ID
CREATE PROCEDURE GetPuntoSeguridadById(IN punto_id INT)
BEGIN
    SELECT 
        id,
        nombre,
        categoria,
        descripcion,
        orden_visualizacion,
        es_critico,
        activo,
        created_at,
        updated_at
    FROM puntos_seguridad_catalogo 
    WHERE id = punto_id AND activo = 1;
END$$

-- Crear punto de seguridad
CREATE PROCEDURE CreatePuntoSeguridad(
    IN p_nombre VARCHAR(100),
    IN p_categoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_orden_visualizacion TINYINT,
    IN p_es_critico TINYINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO puntos_seguridad_catalogo (nombre, categoria, descripcion, orden_visualizacion, es_critico, activo)
    VALUES (p_nombre, p_categoria, p_descripcion, p_orden_visualizacion, p_es_critico, 1);
    
    SELECT LAST_INSERT_ID() as id, 'Punto de seguridad creado exitosamente' as message;
    
    COMMIT;
END$$

-- Actualizar punto de seguridad
CREATE PROCEDURE UpdatePuntoSeguridad(
    IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_categoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_orden_visualizacion TINYINT,
    IN p_es_critico TINYINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE puntos_seguridad_catalogo 
    SET 
        nombre = p_nombre,
        categoria = p_categoria,
        descripcion = p_descripcion,
        orden_visualizacion = p_orden_visualizacion,
        es_critico = p_es_critico,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id AND activo = 1;
    
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Punto de seguridad no encontrado';
    END IF;
    
    SELECT p_id as id, 'Punto de seguridad actualizado exitosamente' as message;
    
    COMMIT;
END$$

-- Obtener puntos de seguridad por orden
CREATE PROCEDURE GetPuntosSeguridadByOrden(IN orden_id INT)
BEGIN
    SELECT 
        ops.id,
        ops.punto_seguridad_id as puntoId,
        ops.estado_id as estadoId,
        ops.notas,
        psc.nombre as puntoNombre,
        psc.categoria,
        psc.es_critico as esCritico,
        es.nombre as estadoNombre,
        es.color as estadoColor,
        es.icon as estadoIcon
    FROM orden_puntos_seguridad ops
    INNER JOIN puntos_seguridad_catalogo psc ON ops.punto_seguridad_id = psc.id
    INNER JOIN estados_seguridad es ON ops.estado_id = es.id
    WHERE ops.orden_id = orden_id
    ORDER BY psc.orden_visualizacion ASC;
END$$

DELIMITER ;

-- ============================================================================
-- VISTAS OPTIMIZADAS
-- ============================================================================

-- Vista completa de órdenes
CREATE VIEW `v_ordenes_completas` AS
SELECT 
    o.id,
    o.numero_orden,
    o.problema_reportado,
    o.diagnostico,
    o.total,
    o.anticipo,
    o.fecha_ingreso,
    o.fecha_promesa,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    c.email AS cliente_email,
    v.marca AS vehiculo_marca,
    v.modelo AS vehiculo_modelo,
    v.anio AS vehiculo_anio,
    v.placas AS vehiculo_placas,
    e.nombre AS estado_nombre,
    e.color AS estado_color,
    u.nombre_completo AS usuario_nombre
FROM ordenes_servicio o
JOIN clientes c ON o.cliente_id = c.id
JOIN vehiculos v ON o.vehiculo_id = v.id
JOIN estados_orden e ON o.estado_id = e.id
JOIN usuarios u ON o.usuario_id = u.id;

-- Vista de dashboard
CREATE VIEW `v_dashboard_stats` AS
SELECT 
    COUNT(*) as total_ordenes,
    SUM(CASE WHEN estado_id IN (1,2,3,4,5,6,7,8) THEN 1 ELSE 0 END) as ordenes_activas,
    SUM(CASE WHEN estado_id = 9 THEN 1 ELSE 0 END) as ordenes_completadas,
    SUM(CASE WHEN DATE(fecha_ingreso) = CURDATE() THEN 1 ELSE 0 END) as ordenes_hoy,
    AVG(total) as ticket_promedio,
    SUM(total) as ingresos_totales
FROM ordenes_servicio 
WHERE DATE(fecha_ingreso) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- ============================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================================================

-- Índices compuestos para queries comunes
CREATE INDEX `idx_ordenes_fecha_estado` ON `ordenes_servicio` (`fecha_ingreso` DESC, `estado_id`);
CREATE INDEX `idx_servicios_orden_precio` ON `servicios_orden` (`orden_id`, `precio_unitario` DESC);
CREATE INDEX `idx_refacciones_orden_precio` ON `refacciones_orden` (`orden_id`, `precio_unitario` DESC);

-- Índices para búsquedas de texto
CREATE INDEX `idx_clientes_nombre_tel` ON `clientes` (`nombre`(20), `telefono`);
CREATE INDEX `idx_vehiculos_placas_marca` ON `vehiculos` (`placas`, `marca`);

-- ============================================================================
-- RESTAURAR CONFIGURACIÓN INICIAL
-- ============================================================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET TIME_ZONE=@OLD_TIME_ZONE;

-- ============================================================================
-- FIN DEL SCHEMA V2.0 "IDEMPOTENTE DE LOS DIOSES"
-- ============================================================================

-- RESUMEN DE MEJORAS IDEMPOTENTES:
-- ✅ USUARIOS NUNCA SE DROPEA - Tabla protegida
-- ✅ Todas las demás tablas se recrean completamente
-- ✅ INSERT IGNORE para datos iniciales - Sin duplicados
-- ✅ IF EXISTS en DROP - Sin errores si no existe
-- ✅ 100% re-ejecutable - Cualquier cantidad de veces
-- ✅ Triggers, procedures y vistas se recrean siempre
-- ✅ Índices siempre actualizados - Sin conflictos
-- ✅ FK constraints siempre correctas
-- ✅ Schema completamente limpio en cada ejecución

SELECT 'SAG GARAGE V2.0 - SCHEMA IDEMPOTENTE LISTO ✅' as STATUS;