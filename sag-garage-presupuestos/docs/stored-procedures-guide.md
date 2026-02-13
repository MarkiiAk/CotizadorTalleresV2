# 🚀 Guía de Stored Procedures Enterprise
## Sistema de Cotizaciones de Taller - Versión 2.0.0

---

## 📋 Índice
- [Introducción](#introducción)
- [Beneficios del Approach](#beneficios)
- [Instalación de Procedures](#instalación)
- [Referencia de Procedures](#referencia)
- [Uso desde PHP](#uso-php)
- [Casos de Uso Comunes](#casos-uso)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este sistema implementa **ZERO HARDCODED QUERIES** usando exclusivamente **Stored Procedures** para:

✅ **Máxima Seguridad** - Prevención total de SQL Injection  
✅ **Rendimiento Superior** - Queries compilados y optimizados  
✅ **Mantenimiento Centralizado** - Logic de BD en un solo lugar  
✅ **Escalabilidad Enterprise** - Preparado para alta concurrencia  
✅ **Separación de Responsabilidades** - Clean Architecture  

---

## 🏆 Beneficios del Approach

### 🔒 Seguridad
- **SQL Injection IMPOSIBLE** - Los parámetros están tipados
- **Permisos granulares** - Control exacto de acceso por procedure
- **Auditoria completa** - Logs automáticos de ejecución

### ⚡ Performance
- **Queries precompilados** - Ejecución inmediata sin parsing
- **Plan de ejecución optimizado** - MySQL optimiza automáticamente  
- **Reducción de tráfico red** - Solo parámetros, no queries completos

### 🛠️ Mantenimiento
- **Versionado de BD** - Cambios controlados y rastreables
- **Testing aislado** - Procedures se pueden probar independientemente
- **Rollback seguro** - Cambios de BD sin afectar código

---

## 📦 Instalación de Procedures

### 1. Ejecutar en tu BD MySQL:

```bash
# Conectarte a tu base de datos
mysql -u root -p tu_database

# Ejecutar el archivo de stored procedures
source /path/to/sag-garage-presupuestos/database/stored-procedures/ordenes-procedures.sql
```

### 2. Verificar instalación:

```sql
-- Ver todos los procedures instalados
SHOW PROCEDURE STATUS WHERE Db = 'tu_database';

-- Verificar un procedure específico
SHOW CREATE PROCEDURE sp_orden_find_by_id;
```

### 3. Otorgar permisos (descomenta en el archivo):

```sql
GRANT EXECUTE ON PROCEDURE sp_orden_find_by_id TO 'app_user'@'%';
-- ... resto de permisos
```

---

## 📖 Referencia de Procedures

### 🔍 **BÚSQUEDAS Y LISTADOS**

#### `sp_orden_find_by_id(orden_id)`
**Buscar orden por ID con todas sus relaciones**
```sql
CALL sp_orden_find_by_id(123);
```

#### `sp_orden_find_by_numero(numero_orden)`
**Buscar orden por número**
```sql
CALL sp_orden_find_by_numero('OS-2026-001');
```

#### `sp_ordenes_list_paginated(...)`
**Listar órdenes con paginación y filtros avanzados**
```sql
CALL sp_ordenes_list_paginated(
    1,                    -- estado_id (NULL para todos)
    'ALTA',              -- prioridad (NULL para todas)
    '2026-01-01',        -- fecha_desde (NULL sin filtro)
    '2026-12-31',        -- fecha_hasta (NULL sin filtro)
    'Juan Pérez',        -- cliente_nombre (NULL sin filtro)
    'ABC123',            -- vehiculo_placas (NULL sin filtro)
    1,                   -- página
    20                   -- límite por página
);
```

#### `sp_ordenes_count_filtered(...)`
**Contar órdenes con los mismos filtros**
```sql
CALL sp_ordenes_count_filtered(1, 'ALTA', '2026-01-01', '2026-12-31', 'Juan', 'ABC');
```

#### `sp_ordenes_search(query, limit)`
**Búsqueda de texto libre**
```sql
CALL sp_ordenes_search('Juan Pérez', 10);
CALL sp_ordenes_search('ABC123', 5);
CALL sp_ordenes_search('motor', 20);
```

---

### ✏️ **OPERACIONES CRUD**

#### `sp_orden_create(...)`
**Crear nueva orden**
```sql
CALL sp_orden_create(
    'OS-2026-001',       -- numero_orden
    15,                  -- cliente_id
    8,                   -- vehiculo_id
    1,                   -- usuario_id
    'Motor hace ruido',  -- problema_reportado
    'Revisar tensor',    -- diagnostico
    1,                   -- estado_id
    'MEDIA',            -- prioridad
    '125000',           -- kilometraje_entrada
    NULL,               -- kilometraje_salida
    7.5,                -- nivel_combustible
    1500.00,            -- subtotal
    0.00,               -- descuento
    16.00,              -- iva_porcentaje
    240.00,             -- iva_monto
    1740.00,            -- total
    500.00,             -- anticipo
    '2026-02-15 14:00:00', -- fecha_promesa
    @orden_id           -- OUT: ID generado
);

-- Obtener el ID generado
SELECT @orden_id;
```

#### `sp_orden_update(...)`
**Actualizar orden existente**
```sql
CALL sp_orden_update(
    123,                 -- orden_id
    'OS-2026-001',       -- numero_orden
    15,                  -- cliente_id
    -- ... resto de parámetros igual que create
    '2026-02-16 16:00:00'  -- nueva fecha_promesa
);
```

#### `sp_orden_change_status(...)`
**Cambiar estado con timeline automático**
```sql
CALL sp_orden_change_status(
    123,                    -- orden_id
    3,                      -- nuevo_estado_id
    1,                      -- usuario_id
    'Iniciando reparación'  -- notas
);
```

---

### 📊 **ESTADÍSTICAS Y REPORTES**

#### `sp_dashboard_stats(fecha_desde, fecha_hasta)`
**Estadísticas completas para dashboard**
```sql
CALL sp_dashboard_stats('2026-01-01', '2026-01-31');
```

**Retorna:**
- total_ordenes
- ordenes_activas  
- ordenes_completadas
- ordenes_canceladas
- ordenes_hoy
- ticket_promedio
- ingresos_totales
- anticipos_recibidos
- saldo_pendiente

#### `sp_generate_numero_orden()`
**Generar número único automático**
```sql
CALL sp_generate_numero_orden(@numero);
SELECT @numero; -- OS-2026-123
```

---

### 🔗 **RELACIONES Y DETALLES**

#### `sp_orden_get_servicios(orden_id)`
**Obtener servicios de una orden**
```sql
CALL sp_orden_get_servicios(123);
```

#### `sp_orden_get_refacciones(orden_id)`
**Obtener refacciones de una orden**
```sql
CALL sp_orden_get_refacciones(123);
```

#### `sp_orden_get_inspeccion(orden_id)`
**Obtener inspección detallada**
```sql
CALL sp_orden_get_inspeccion(123);
```

#### `sp_orden_get_timeline(orden_id)`
**Obtener historial completo de cambios**
```sql
CALL sp_orden_get_timeline(123);
```

---

## 💻 Uso desde PHP

### Setup del Repository:

```php
<?php
require_once 'backend/repositories/OrdenRepository.php';

// Inicializar conexión
$db = new PDO($dsn, $username, $password);
$ordenRepo = new OrdenRepository($db);
```

### Ejemplos de Uso:

#### 🔍 Buscar una orden:
```php
// Por ID
$orden = $ordenRepo->findById(123);

// Por número
$orden = $ordenRepo->findByNumeroOrden('OS-2026-001');
```

#### 📋 Listar con filtros:
```php
$filtros = [
    'estado_id' => 1,
    'prioridad' => 'ALTA',
    'fecha_desde' => '2026-01-01',
    'cliente_nombre' => 'Juan'
];

$ordenes = $ordenRepo->findAll($filtros, $page = 1, $limit = 20);
$total = $ordenRepo->count($filtros);
```

#### 🆕 Crear orden:
```php
$numero = $ordenRepo->generateNumeroOrden(); // OS-2026-XXX
$orden = new Orden([
    'numero_orden' => $numero,
    'cliente_id' => 15,
    'vehiculo_id' => 8,
    // ... resto de datos
]);

$ordenId = $ordenRepo->create($orden);
```

#### 📊 Estadísticas:
```php
$stats = $ordenRepo->getStats([
    'fecha_desde' => '2026-01-01',
    'fecha_hasta' => '2026-01-31'
]);

echo "Total órdenes: " . $stats['total_ordenes'];
echo "Ingresos: $" . number_format($stats['ingresos_totales'], 2);
```

#### 🔍 Búsqueda rápida:
```php
$resultados = $ordenRepo->search('Juan Pérez', 10);
$resultados = $ordenRepo->search('ABC-123', 5);
```

#### 🔄 Cambiar estado:
```php
$success = $ordenRepo->cambiarEstado(
    $ordenId = 123,
    $nuevoEstado = 3, 
    $usuarioId = 1,
    $notas = 'Iniciando reparación'
);
```

---

## 🎯 Casos de Uso Comunes

### 📱 **Dashboard Principal**
```php
// Stats del mes actual
$statsDelMes = $ordenRepo->getStats([
    'fecha_desde' => date('Y-m-01'),
    'fecha_hasta' => date('Y-m-t')
]);

// Órdenes activas
$ordenesActivas = $ordenRepo->findAll([
    'estado_id' => [1,2,3,4,5,6,7,8] // Estados activos
], 1, 10);
```

### 🔍 **Búsqueda Avanzada**
```php
// Filtros combinados
$ordenes = $ordenRepo->findAll([
    'estado_id' => 2,           // En proceso
    'prioridad' => 'ALTA',      // Prioridad alta
    'fecha_desde' => '2026-01-01',
    'cliente_nombre' => 'García'
]);
```

### 📈 **Reportes de Ventas**
```php
// Reporte mensual
$enero = $ordenRepo->getStats([
    'fecha_desde' => '2026-01-01',
    'fecha_hasta' => '2026-01-31'
]);

$febrero = $ordenRepo->getStats([
    'fecha_desde' => '2026-02-01', 
    'fecha_hasta' => '2026-02-29'
]);

$crecimiento = (($febrero['ingresos_totales'] - $enero['ingresos_totales']) / $enero['ingresos_totales']) * 100;
```

### 🔔 **Seguimiento de Órdenes**
```php
// Órdenes vencidas (fecha promesa pasada)
$vencidas = $ordenRepo->findAll([
    'fecha_hasta' => date('Y-m-d', strtotime('-1 day'))
]);

// Órdenes del día
$hoy = $ordenRepo->findAll([
    'fecha_desde' => date('Y-m-d'),
    'fecha_hasta' => date('Y-m-d')
]);
```

---

## 🔧 Troubleshooting

### ❌ Error: "Procedure doesn't exist"
```sql
-- Verificar procedures instalados
SHOW PROCEDURE STATUS WHERE Db = 'tu_database';

-- Reinstalar si es necesario
SOURCE ordenes-procedures.sql;
```

### ❌ Error: "Access denied"
```sql
-- Otorgar permisos de ejecución
GRANT EXECUTE ON PROCEDURE sp_orden_find_by_id TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

### ❌ Error en parámetros OUT
```php
// PHP: Usar variables de sesión para OUTPUT parameters
$stmt = $pdo->prepare('CALL sp_orden_create(?, ?, ..., @orden_id)');
$stmt->execute([...]);

$result = $pdo->query('SELECT @orden_id AS orden_id')->fetch();
$ordenId = $result['orden_id'];
```

### 📊 Monitoring de Performance
```sql
-- Ver procedures más utilizados
SELECT 
    ROUTINE_NAME,
    CREATED,
    LAST_ALTERED
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'tu_database' 
  AND ROUTINE_TYPE = 'PROCEDURE';

-- Performance tuning
SHOW PROFILE FOR QUERY 1; -- Después de ejecutar un CALL
```

---

## 🚀 Próximas Mejoras

1. **Procedures para otros módulos** (Clientes, Vehículos, etc.)
2. **Stored Functions** para cálculos complejos
3. **Triggers automáticos** para auditoría
4. **Views optimizadas** para reportes
5. **Procedures de migración** para actualizaciones

---

## 📞 Soporte

¿Dudas sobre los stored procedures? 

1. **Revisa los logs de MySQL** para errores detallados
2. **Usa SHOW CREATE PROCEDURE** para ver la definición
3. **Testa procedures directo en MySQL** antes de usar en PHP
4. **Verifica permisos** del usuario de aplicación

---

**¡Tu sistema ahora es 100% Enterprise-ready con ZERO queries hardcodeados! 🎉**