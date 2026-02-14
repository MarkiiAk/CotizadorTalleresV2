<?php
/**
 * Configuración y manejo de JWT
 */

// Cargar variables de entorno si existe el archivo .env
if (file_exists(__DIR__ . '/../.env.production')) {
    $env = parse_ini_file(__DIR__ . '/../.env.production');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Configuración JWT
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'SagGarage_JWT_Secret_Key_2024_Production_V2');
define('JWT_ALGORITHM', 'HS256');

/**
 * Función helper para requerir autenticación
 */
function requireAuth() {
    $headers = getallheaders();
    if (!$headers) {
        $headers = apache_request_headers();
    }
    
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        throw new Exception('Token de autorización requerido');
    }
    
    $token = substr($authHeader, 7); // Remover "Bearer "
    
    try {
        $decoded = JWT::decode($token);
        return (array) $decoded;
    } catch (Exception $e) {
        throw new Exception('Token inválido: ' . $e->getMessage());
    }
}

/**
 * Clase JWT para manejo de tokens
 */
class JWT {
    /**
     * Codificar payload en token JWT
     */
    public static function encode($payload, $key = null, $algorithm = null) {
        $key = $key ?? JWT_SECRET;
        $algorithm = $algorithm ?? JWT_ALGORITHM;
        
        $header = json_encode(['typ' => 'JWT', 'alg' => $algorithm]);
        $payload = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Decodificar token JWT
     */
    public static function decode($jwt, $key = null, $algorithm = null) {
        $key = $key ?? JWT_SECRET;
        $algorithm = $algorithm ?? JWT_ALGORITHM;
        
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            throw new Exception('Token JWT inválido');
        }
        
        $header = json_decode(base64_decode($tokenParts[0]), true);
        $payload = json_decode(base64_decode($tokenParts[1]), true);
        $signature = $tokenParts[2];
        
        // Verificar algoritmo
        if (!isset($header['alg']) || $header['alg'] !== $algorithm) {
            throw new Exception('Algoritmo no válido');
        }
        
        // Verificar expiración
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expirado');
        }
        
        // Verificar firma
        $expectedSignature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], $key, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
        
        if ($signature !== $expectedSignature) {
            throw new Exception('Firma de token inválida');
        }
        
        return (object) $payload;
    }
    
    /**
     * Verificar si un token es válido
     */
    public static function verify($jwt, $key = null) {
        try {
            self::decode($jwt, $key);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}