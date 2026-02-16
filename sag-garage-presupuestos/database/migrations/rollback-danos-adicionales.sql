-- ============================================================================
-- ROLLBACK COMPLETO: ELIMINAR TABLA DANOS_ADICIONALES_VEHICULO
-- ============================================================================
-- Fecha: Febrero 2026
-- Autor: SAG Garage Development Team
-- Propósito: Eliminar completamente cualquier rastro de la tabla danos_adicionales_vehiculo
-- ============================================================================

-- Desactivar verificaciones
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;

-- Eliminar stored procedures relacionados si existen
DROP PROCEDURE IF EXISTS `sp_orden_get_danos_adicionales`;
DROP PROCEDURE IF EXISTS `sp_orden_insert_dano_adicional`;
DROP PROCEDURE IF EXISTS `sp_orden_update_dano_adicional`;
DROP PROCEDURE IF EXISTS `sp_orden_delete_dano_adicional`;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS `danos_adicionales_vehiculo`;

-- Restaurar verificaciones
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

SELECT 'ROLLBACK COMPLETO: Tabla danos_adicionales_vehiculo eliminada ✅' as STATUS;