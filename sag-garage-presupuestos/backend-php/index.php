<?php
/**
 * SAG Garage - Backend API PHP
 * Compatible con cPanel / Hosting compartido
 */

// Configuración de CORS - Permitir origen del frontend
header('Access-Control-Allow-Origin: https://saggarage.com.mx');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar configuración
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';

// Cargar modelos y repositorios V2.0
require_once __DIR__ . '/models/Orden.php';
require_once __DIR__ . '/repositories/OrdenRepository.php';

// Cargar controladores
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/OrdenesController.php';
require_once __DIR__ . '/controllers/EstadosSeguridadController.php';
require_once __DIR__ . '/controllers/PuntosSeguridadController.php';
require_once __DIR__ . '/controllers/SeguimientoController.php';

// Obtener conexión a base de datos
$db = Database::getInstance()->getConnection();

// Obtener la ruta y método
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remover query string y obtener path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remover el prefijo correcto según la URL del error
$path = str_replace('/n3wv3r510nh1dd3n/backend-php/', '', $path);
$path = str_replace('/gestion/backend-php/', '', $path);
$path = trim($path, '/');

// Log de debug para entender la ruta
error_log("BACKEND PHP DEBUG - Request URI: " . $request_uri);
error_log("BACKEND PHP DEBUG - Path procesado: " . $path);
error_log("BACKEND PHP DEBUG - Method: " . $request_method);

// Router simple
try {
    // Rutas de autenticación
    if ($path === 'auth/login' && $request_method === 'POST') {
        $controller = new AuthController();
        $controller->login();
    }
    elseif ($path === 'auth/verify' && $request_method === 'GET') {
        $controller = new AuthController();
        $controller->verify();
    }
    elseif ($path === 'auth/me' && $request_method === 'GET') {
        $controller = new AuthController();
        $controller->me();
    }
    elseif ($path === 'auth/create-user' && $request_method === 'POST') {
        $controller = new AuthController();
        $controller->createUser();
    }
    
    // Rutas de órdenes
    elseif ($path === 'ordenes' && $request_method === 'GET') {
        $controller = new OrdenesController();
        $controller->getAll();
    }
    elseif (preg_match('#^ordenes/([0-9]+)$#', $path, $matches) && $request_method === 'GET') {
        $controller = new OrdenesController();
        $controller->getById($matches[1]);
    }
    elseif ($path === 'ordenes' && $request_method === 'POST') {
        $controller = new OrdenesController();
        $controller->create();
    }
    elseif (preg_match('#^ordenes/([0-9]+)$#', $path, $matches) && $request_method === 'PUT') {
        $controller = new OrdenesController();
        $controller->update($matches[1]);
    }
    elseif (preg_match('#^ordenes/([0-9]+)$#', $path, $matches) && $request_method === 'DELETE') {
        $controller = new OrdenesController();
        $controller->delete($matches[1]);
    }
    elseif ($path === 'ordenes/estados' && $request_method === 'GET') {
        $controller = new OrdenesController();
        $controller->getEstados();
    }
    elseif ($path === 'elementos-inspeccion' && $request_method === 'GET') {
        $controller = new OrdenesController();
        $controller->getElementosInspeccion();
    }
    elseif (preg_match('#^ordenes/([0-9]+)/estado$#', $path, $matches) && $request_method === 'PATCH') {
        $controller = new OrdenesController();
        $controller->changeStatus($matches[1]);
    }
    
    // Rutas de Estados de Seguridad
    elseif ($path === 'estados-seguridad' && $request_method === 'GET') {
        $controller = new EstadosSeguridadController($db);
        $controller->getEstados();
    }
    elseif (preg_match('#^estados-seguridad/([0-9]+)$#', $path, $matches) && $request_method === 'GET') {
        $controller = new EstadosSeguridadController($db);
        $controller->getEstadoById($matches[1]);
    }
    elseif ($path === 'admin/estados-seguridad' && $request_method === 'POST') {
        $controller = new EstadosSeguridadController($db);
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->createEstado($data);
    }
    elseif (preg_match('#^admin/estados-seguridad/([0-9]+)$#', $path, $matches) && $request_method === 'PUT') {
        $controller = new EstadosSeguridadController($db);
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->updateEstado($matches[1], $data);
    }
    elseif (preg_match('#^admin/estados-seguridad/([0-9]+)$#', $path, $matches) && $request_method === 'DELETE') {
        $controller = new EstadosSeguridadController($db);
        $controller->deleteEstado($matches[1]);
    }
    
    // Rutas de Puntos de Seguridad
    elseif ($path === 'puntos-seguridad/catalogo' && $request_method === 'GET') {
        $controller = new PuntosSeguridadController($db);
        $controller->getCatalogo();
    }
    elseif (preg_match('#^puntos-seguridad/catalogo/([0-9]+)$#', $path, $matches) && $request_method === 'GET') {
        $controller = new PuntosSeguridadController($db);
        $controller->getPuntoById($matches[1]);
    }
    elseif (preg_match('#^ordenes/([0-9]+)/puntos-seguridad$#', $path, $matches) && $request_method === 'GET') {
        $controller = new PuntosSeguridadController($db);
        $controller->getPuntosByOrden($matches[1]);
    }
    elseif (preg_match('#^ordenes/([0-9]+)/puntos-seguridad$#', $path, $matches) && $request_method === 'POST') {
        $controller = new PuntosSeguridadController($db);
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->savePuntosByOrden($matches[1], $data);
    }
    elseif ($path === 'admin/puntos-seguridad/catalogo' && $request_method === 'POST') {
        $controller = new PuntosSeguridadController($db);
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->createPunto($data);
    }
    elseif (preg_match('#^admin/puntos-seguridad/catalogo/([0-9]+)$#', $path, $matches) && $request_method === 'PUT') {
        $controller = new PuntosSeguridadController($db);
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->updatePunto($matches[1], $data);
    }
    elseif (preg_match('#^admin/puntos-seguridad/catalogo/([0-9]+)$#', $path, $matches) && $request_method === 'DELETE') {
        $controller = new PuntosSeguridadController($db);
        $controller->deletePunto($matches[1]);
    }
    
    // Rutas de seguimiento público
    elseif ($path === 'seguimiento/crear-token' && $request_method === 'POST') {
        $controller = new SeguimientoController();
        $controller->crearToken();
    }
    elseif (preg_match('#^seguimiento/([A-Z0-9\-]+)$#', $path, $matches) && $request_method === 'GET') {
        $controller = new SeguimientoController();
        $controller->getSeguimientoInfo($matches[1]);
    }
    elseif (preg_match('#^seguimiento/orden/([0-9]+)/tokens$#', $path, $matches) && $request_method === 'GET') {
        $controller = new SeguimientoController();
        $controller->getTokensOrden($matches[1]);
    }
    elseif (preg_match('#^seguimiento/token/([A-Z0-9\-]+)$#', $path, $matches) && $request_method === 'DELETE') {
        $controller = new SeguimientoController();
        $controller->desactivarToken($matches[1]);
    }
    
    // Ruta de salud
    elseif ($path === 'health' && $request_method === 'GET') {
        echo json_encode([
            'status' => 'ok',
            'database' => 'MySQL conectado',
            'timestamp' => time()
        ]);
    }
    
    // Ruta no encontrada
    else {
        error_log("BACKEND PHP ERROR - Ruta no encontrada: $path (método: $request_method)");
        http_response_code(404);
        echo json_encode([
            'error' => 'Ruta no encontrada',
            'path' => $path,
            'method' => $request_method,
            'request_uri' => $request_uri,
            'available_routes' => [
                'POST auth/login',
                'GET auth/verify',
                'GET auth/me',
                'GET ordenes',
                'POST ordenes',
                'GET ordenes/{id}',
                'PUT ordenes/{id}',
                'DELETE ordenes/{id}',
                'GET estados-seguridad',
                'GET puntos-seguridad/catalogo',
                'GET health'
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ]);
}