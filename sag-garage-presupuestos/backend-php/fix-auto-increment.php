<?php
/**
 * Script para cambiar el AUTO_INCREMENT de la tabla ordenes_servicio a 1650
 */

require_once 'config/database.php';

try {
    // Obtener conexión a la base de datos
    $db = Database::getInstance()->getConnection();
    
    echo "=== CAMBIO DE AUTO_INCREMENT ===\n";
    
    // 1. Verificar el AUTO_INCREMENT actual
    $stmt = $db->query("SHOW TABLE STATUS LIKE 'ordenes_servicio'");
    $tableInfo = $stmt->fetch();
    $currentAutoIncrement = $tableInfo['Auto_increment'];
    
    echo "AUTO_INCREMENT actual: " . $currentAutoIncrement . "\n";
    
    // 2. Mostrar los IDs existentes
    $stmt = $db->query("SELECT id, numero_orden FROM ordenes_servicio ORDER BY id");
    $existingRecords = $stmt->fetchAll();
    
    echo "Registros existentes:\n";
    foreach ($existingRecords as $record) {
        echo "  ID: {$record['id']}, Folio: {$record['numero_orden']}\n";
    }
    
    // 3. Cambiar AUTO_INCREMENT a 1650
    echo "\nCambiando AUTO_INCREMENT a 1650...\n";
    $stmt = $db->exec("ALTER TABLE ordenes_servicio AUTO_INCREMENT = 1650");
    
    // 4. Verificar el cambio
    $stmt = $db->query("SHOW TABLE STATUS LIKE 'ordenes_servicio'");
    $tableInfo = $stmt->fetch();
    $newAutoIncrement = $tableInfo['Auto_increment'];
    
    echo "Nuevo AUTO_INCREMENT: " . $newAutoIncrement . "\n";
    
    if ($newAutoIncrement == 1650) {
        echo "✅ AUTO_INCREMENT cambiado exitosamente a 1650\n";
        echo "El próximo registro tendrá ID: 1650\n";
    } else {
        echo "❌ Error: AUTO_INCREMENT no se cambió correctamente\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}