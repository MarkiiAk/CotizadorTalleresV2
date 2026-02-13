-- ============================================================================
-- SAG GARAGE V2.0 - ENTERPRISE DATABASE SCHEMA FIXED
-- "BASE DE DATOS DE LOS DIOSES - SIN ERRORES" 
-- ============================================================================
-- Fecha: Febrero 2026
-- Versión: 2.0.1 FIXED
-- Autor: SAG Garage Development Team
-- Descripción: Schema optimizado SIN particiones que conflicten con FK
-- ============================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET @OLD_TIME_ZONE=@@TIME_ZONE, TIME_ZONE='+00:00';

-- ============================================================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ============================================================================

-- Base de datos creada desde cPanel: saggarag_CotizadorTalleres
USE `saggarag_CotizadorTalleres`;

-- ============================================================================
-- TABLA: USUARIOS (CLEAN & OPTIMIZED)
-- ============================================================================

CREATE TABLE `usuarios` (
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
COMMENT='Usuarios del sistema con roles y permisos';

-- ============================================================================
-- TABLA: CLIENTES (ULTRA CLEAN)
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
  FULLTEXT KEY `ft_clientes_busqueda` (`nombre`, `telefono`, `email`),
  
  CONSTRAINT `chk_clientes_telefono` CHECK (`telefono` IS NULL OR `telefono` REGEXP '^[0-9]{10}$'),
  CONSTRAINT `chk_clientes_email` CHECK (`email` IS NULL OR `email` REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
COMMENT='Clientes del sistema - información básica';

-- ============================================================================
-- TABLA: VEHICULOS (OPTIMIZED)
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
