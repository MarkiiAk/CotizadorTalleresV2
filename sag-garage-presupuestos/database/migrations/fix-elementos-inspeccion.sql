-- ============================================================================
-- FIX ELEMENTOS_INSPECCION - LIMPIEZA TOTAL Y NORMALIZACIÓN
-- Elimina elementos que no corresponden al frontend y normaliza categorías
-- ============================================================================

USE `saggarag_CotizadorTalleres`;

-- ============================================================================
-- ELIMINAR TODOS LOS ELEMENTOS EXISTENTES
-- ============================================================================
DELETE FROM `inspeccion_vehiculo`; -- Eliminar referencias primero
DELETE FROM `elementos_inspeccion`; -- Eliminar todos los elementos

-- ============================================================================
-- INSERTAR SOLO LOS ELEMENTOS QUE CORRESPONDEN AL FRONTEND
-- CATEGORÍAS VÁLIDAS: 'exterior' e 'interior' (SINGULAR)
-- ============================================================================

INSERT INTO `elementos_inspeccion` (`id`, `nombre`, `categoria`, `obligatorio`, `orden_visual`, `activo`) VALUES

-- ============================================================================
-- EXTERIORES (categoria = 'exterior')
-- ============================================================================
(1, 'Luces Frontales', 'exterior', 1, 1, 1),
(2, 'Cuarto de Luces', 'exterior', 1, 2, 1),
(3, 'Antena', 'exterior', 0, 3, 1),
(4, 'Espejos Laterales', 'exterior', 1, 4, 1),
(5, 'Cristales', 'exterior', 1, 5, 1),
(6, 'Emblemas', 'exterior', 0, 6, 1),
(7, 'Llantas', 'exterior', 1, 7, 1),
(8, 'Tapón de Ruedas', 'exterior', 0, 8, 1),
(9, 'Molduras Completas', 'exterior', 0, 9, 1),
(10, 'Tapón de Gasolina', 'exterior', 1, 10, 1),
(11, 'Limpiadores', 'exterior', 1, 11, 1),

-- ============================================================================
-- INTERIORES (categoria = 'interior')
-- ============================================================================
(12, 'Instrumento de Tablero', 'interior', 1, 12, 1),
(13, 'Calefacción', 'interior', 1, 13, 1),
(14, 'Sistema de Sonido', 'interior', 0, 14, 1),
(15, 'Bocinas', 'interior', 0, 15, 1),
(16, 'Espejo Retrovisor', 'interior', 1, 16, 1),
(17, 'Cinturones de Seguridad', 'interior', 1, 17, 1),
(18, 'Botonería General', 'interior', 1, 18, 1),
(19, 'Manijas', 'interior', 1, 19, 1),
(20, 'Tapetes', 'interior', 0, 20, 1),
(21, 'Vestiduras', 'interior', 1, 21, 1),
(22, 'Otros', 'interior', 0, 22, 1);

-- ============================================================================
-- RESETEAR AUTO_INCREMENT
-- ============================================================================
ALTER TABLE `elementos_inspeccion` AUTO_INCREMENT = 23;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 
    id,
    nombre,
    categoria,
    activo,
    CASE 
        WHEN categoria = 'exterior' THEN '✅ EXTERIOR'
        WHEN categoria = 'interior' THEN '✅ INTERIOR'
        ELSE '❌ CATEGORÍA INVÁLIDA'
    END as status
FROM elementos_inspeccion 
ORDER BY categoria, orden_visual;

SELECT CONCAT('✅ LIMPIEZA COMPLETADA - ', COUNT(*), ' elementos válidos') as RESULTADO
FROM elementos_inspeccion 
WHERE categoria IN ('exterior', 'interior');

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- ✅ Solo categorías 'exterior' e 'interior' (SINGULAR)
-- ✅ Nombres exactos que coinciden con el mapeo del backend
-- ✅ Sin elementos de 'Herramientas', 'Seguridad', 'Documentación'
-- ✅ Solo elementos que existen en InspeccionSection.tsx
-- ❌ ELIMINADOS: Gato, Herramienta, Extinguidor, Documentos, etc.