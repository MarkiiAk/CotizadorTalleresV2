-- Migration: Actualizar estados de órdenes v2
-- Fecha: 2026-02-16
-- Descripción: Redefinir workflow de estados con 14 estados optimizados

-- Primero, eliminamos los estados existentes (manteniendo las órdenes intactas)
DELETE FROM estados_orden;

-- Reiniciamos el auto_increment
ALTER TABLE estados_orden AUTO_INCREMENT = 1;

-- Insertamos los nuevos 14 estados con el workflow optimizado (CON updated_at ya agregado al schema)
INSERT INTO estados_orden (id, nombre, descripcion, color, workflow_order, activo, created_at, updated_at) VALUES
(1, 'Prospecto', 'Cliente potencial, primer contacto', '#6c757d', 1, 1, NOW(), NOW()),
(2, 'Recibido', 'Vehículo ingresado al taller', '#17a2b8', 2, 1, NOW(), NOW()),
(3, 'En Diagnóstico', 'Revisando el problema', '#ffc107', 3, 1, NOW(), NOW()),
(4, 'Presupuesto Listo', 'Cotización preparada', '#fd7e14', 4, 1, NOW(), NOW()),
(5, 'Esperando Aprobación', 'Cliente debe aprobar presupuesto', '#e83e8c', 5, 1, NOW(), NOW()),
(6, 'Orden Aprobada', 'Cliente aprobó, trabajo confirmado', '#28a745', 6, 1, NOW(), NOW()),
(7, 'En Trabajo', 'Reparación/servicio en proceso', '#007bff', 7, 1, NOW(), NOW()),
(8, 'Esperando Refacciones', 'Pausado esperando partes', '#6f42c1', 8, 1, NOW(), NOW()),
(9, 'En Pruebas', 'Probando funcionamiento', '#20c997', 9, 1, NOW(), NOW()),
(10, 'Listo para Entrega', 'Trabajo completado', '#198754', 10, 1, NOW(), NOW()),
(11, 'Entregado', 'Cliente recogió vehículo', '#0d6efd', 11, 1, NOW(), NOW()),
(12, 'Pagado', 'Facturado y pagado completamente', '#198754', 12, 1, NOW(), NOW()),
(13, 'En Garantía', 'Regresó por garantía', '#fd7e14', 13, 1, NOW(), NOW()),
(14, 'Cancelado', 'Orden cancelada', '#dc3545', 99, 1, NOW(), NOW());

-- Actualizar órdenes existentes para usar el nuevo sistema (tabla correcta: ordenes_servicio)
-- Mapear estados antiguos a nuevos (si existen órdenes)
UPDATE ordenes_servicio SET estado_id = 2 WHERE estado_id IN (1); -- Recibido -> Recibido
UPDATE ordenes_servicio SET estado_id = 3 WHERE estado_id IN (2); -- En Diagnóstico -> En Diagnóstico  
UPDATE ordenes_servicio SET estado_id = 4 WHERE estado_id IN (3); -- Cotización Lista -> Presupuesto Listo
UPDATE ordenes_servicio SET estado_id = 6 WHERE estado_id IN (4); -- Aprobado -> Orden Aprobada
UPDATE ordenes_servicio SET estado_id = 7 WHERE estado_id IN (5); -- En Trabajo -> En Trabajo
UPDATE ordenes_servicio SET estado_id = 8 WHERE estado_id IN (6); -- Esperando Refacciones -> Esperando Refacciones
UPDATE ordenes_servicio SET estado_id = 9 WHERE estado_id IN (7); -- En Pruebas -> En Pruebas
UPDATE ordenes_servicio SET estado_id = 10 WHERE estado_id IN (8); -- Listo para Entrega -> Listo para Entrega
UPDATE ordenes_servicio SET estado_id = 11 WHERE estado_id IN (9); -- Entregado -> Entregado
UPDATE ordenes_servicio SET estado_id = 14 WHERE estado_id IN (10); -- Cancelado -> Cancelado

-- No hay estado_anterior_id en ordenes_servicio, esto se maneja en orden_timeline

-- Verificar resultado
SELECT 'Estados creados:', COUNT(*) as total FROM estados_orden;
SELECT 'Órdenes actualizadas:', COUNT(*) as total FROM ordenes_servicio WHERE estado_id BETWEEN 1 AND 14;
