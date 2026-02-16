-- ============================================================================
-- LIMPIEZA FINAL - ELIMINAR ELEMENTOS BASURA CREADOS POR FRONTEND KEYS
-- Solo mantener los elementos válidos del schema original
-- ============================================================================

USE `saggarag_CotizadorTalleres`;

-- ============================================================================
-- ELIMINAR ELEMENTOS BASURA (creados con keys del frontend)
-- ============================================================================

-- Elementos con nombres como "espejoRetrovisor", "instrumentoTablero", etc.
DELETE FROM elementos_inspeccion 
WHERE nombre IN (
    'espejoRetrovisor',
    'instrumentoTablero', 
    'sistemaSonido',
    'botoniaGeneral',
    'moldurasCompletas',
    'taponGasolina',
    'espejosLaterales',
    'cuartoLuces',
    'lucesFrontales',
    'taponRuedas',
    'cinturones',
    'calefaccion',
    'cristales',
    'emblemas',
    'llantas',
    'limpiadores',
    'antena',
    'bocinas',
    'manijas',
    'tapetes',
    'vestiduras',
    'otros'
);

-- ============================================================================
-- VERIFICAR QUE SOLO QUEDEN ELEMENTOS VÁLIDOS
-- ============================================================================
SELECT 
    id, nombre, categoria, activo,
    CASE 
        WHEN nombre IN (
            'Luces Frontales', 'Cuarto de Luces', 'Antena', 'Espejos Laterales', 'Cristales', 'Emblemas',
            'Llantas', 'Tapón de Ruedas', 'Molduras Completas', 'Tapón de Gasolina', 'Limpiadores'
        ) AND categoria = 'exterior' THEN '✅ EXTERIOR OK'
        WHEN nombre IN (
            'Instrumento de Tablero', 'Calefacción', 'Sistema de Sonido', 'Bocinas', 'Espejo Retrovisor',
            'Cinturones de Seguridad', 'Botonería General', 'Manijas', 'Tapetes', 'Vestiduras', 'Otros'
        ) AND categoria = 'interior' THEN '✅ INTERIOR OK'
        ELSE '❌ ELEMENTO PROBLEMÁTICO'
    END as estado
FROM elementos_inspeccion 
WHERE activo = 1
ORDER BY categoria, nombre;

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
SELECT 
    categoria,
    COUNT(*) as total_elementos
FROM elementos_inspeccion 
WHERE activo = 1
GROUP BY categoria
ORDER BY categoria;

SELECT '🎯 LIMPIEZA COMPLETADA - SOLO ELEMENTOS VÁLIDOS PERMANECEN' as RESULTADO;