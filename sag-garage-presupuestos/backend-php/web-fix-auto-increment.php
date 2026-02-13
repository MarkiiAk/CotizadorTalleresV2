<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix AUTO_INCREMENT - Ordenes Servicio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: green; background: #d4edda; padding: 10px; border: 1px solid #c3e6cb; border-radius: 4px; margin: 10px 0; }
        .error { color: red; background: #f8d7da; padding: 10px; border: 1px solid #f5c6cb; border-radius: 4px; margin: 10px 0; }
        .info { color: blue; background: #d1ecf1; padding: 10px; border: 1px solid #bee5eb; border-radius: 4px; margin: 10px 0; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Fix AUTO_INCREMENT - Tabla ordenes_servicio</h1>
        
        <?php
        require_once 'config/database.php';
        
        $action = $_GET['action'] ?? 'show';
        
        try {
            $db = Database::getInstance()->getConnection();
            
            if ($action === 'show') {
                // Mostrar estado actual
                echo '<div class="info"><strong>Estado Actual:</strong></div>';
                
                // Verificar AUTO_INCREMENT actual
                $stmt = $db->query("SHOW TABLE STATUS LIKE 'ordenes_servicio'");
                $tableInfo = $stmt->fetch();
                $currentAutoIncrement = $tableInfo['Auto_increment'];
                
                echo "<p><strong>AUTO_INCREMENT actual:</strong> {$currentAutoIncrement}</p>";
                
                // Mostrar registros existentes
                $stmt = $db->query("SELECT id, numero_orden, problema_reportado FROM ordenes_servicio ORDER BY id");
                $existingRecords = $stmt->fetchAll();
                
                echo "<p><strong>Registros existentes:</strong> " . count($existingRecords) . "</p>";
                
                if (count($existingRecords) > 0) {
                    echo "<pre>";
                    foreach ($existingRecords as $record) {
                        $problema = substr($record['problema_reportado'], 0, 50);
                        echo "ID: {$record['id']}, Folio: {$record['numero_orden']}, Problema: {$problema}...\n";
                    }
                    echo "</pre>";
                }
                
                echo '<p><a href="?action=fix" class="btn">🚀 Cambiar AUTO_INCREMENT a 1650</a></p>';
                
            } elseif ($action === 'fix') {
                // Ejecutar el cambio
                echo '<div class="info"><strong>Ejecutando cambio de AUTO_INCREMENT...</strong></div>';
                
                // Verificar estado antes
                $stmt = $db->query("SHOW TABLE STATUS LIKE 'ordenes_servicio'");
                $tableInfo = $stmt->fetch();
                $oldAutoIncrement = $tableInfo['Auto_increment'];
                echo "<p>AUTO_INCREMENT anterior: {$oldAutoIncrement}</p>";
                
                // Hacer el cambio
                $db->exec("ALTER TABLE ordenes_servicio AUTO_INCREMENT = 1650");
                
                // Verificar estado después
                $stmt = $db->query("SHOW TABLE STATUS LIKE 'ordenes_servicio'");
                $tableInfo = $stmt->fetch();
                $newAutoIncrement = $tableInfo['Auto_increment'];
                
                if ($newAutoIncrement == 1650) {
                    echo '<div class="success">';
                    echo "<strong>✅ SUCCESS:</strong> AUTO_INCREMENT cambiado exitosamente<br>";
                    echo "Antes: {$oldAutoIncrement}<br>";
                    echo "Después: {$newAutoIncrement}<br>";
                    echo "<strong>El próximo registro tendrá ID: 1650</strong>";
                    echo '</div>';
                } else {
                    echo '<div class="error">';
                    echo "<strong>❌ ERROR:</strong> AUTO_INCREMENT no se cambió correctamente<br>";
                    echo "Esperado: 1650<br>";
                    echo "Actual: {$newAutoIncrement}";
                    echo '</div>';
                }
                
                echo '<p><a href="?" class="btn">🔄 Ver estado actual</a></p>';
            }
            
        } catch (Exception $e) {
            echo '<div class="error">';
            echo "<strong>❌ Error:</strong> " . htmlspecialchars($e->getMessage());
            echo '</div>';
            echo '<p><a href="?" class="btn">🔄 Intentar de nuevo</a></p>';
        }
        ?>
        
        <hr>
        <p><small><strong>Nota:</strong> Este cambio no afecta los registros existentes, solo establece que el próximo registro insertado tendrá ID 1650.</small></p>
    </div>
</body>
</html>