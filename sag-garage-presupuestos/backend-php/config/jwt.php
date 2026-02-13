<?php
/**
 * Utilidades JWT para autenticación
 * Implementación simple sin dependencias externas
 */

class JWT {
    private static $secret_key = 'sag-garage-secret-key-2026-change-in-production';
    private static $algorithm = 'HS256';
    
    /**
     * Genera un token JWT
     */
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload = json_encode($payload);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::$secret_key,
            true
        );
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    /**
     * Decodifica y verifica un token JWT
     */
    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) !== 3) {
            throw new Exception('Token inválido');
        }
        
        list($header, $payload, $signature) = $tokenParts;
        
        // Verificar firma
        $expectedSignature = hash_hmac(
            'sha256',
            $header . "." . $payload,
            self::$secret_key,
            true
        );
        $expectedSignature = self::base64UrlEncode($expectedSignature);
        
        if ($signature !== $expectedSignature) {
            throw new Exception('Firma inválida');
        }
        
        // Decodificar payload
        $payload = json_decode(self::base64UrlDecode($payload), true);
        
        // Verificar expiración
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expirado');
        }
        
        return $payload;
    }
    
    /**
     * Obtiene el token del header Authorization
     */
    public static function getBearerToken() {
        $headers = self::getAuthorizationHeader();
        
        if (!empty($headers)) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    /**
     * Obtiene el header Authorization
     */
    private static function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        return $headers;
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}

/**
 * Middleware para verificar autenticación
 */
function requireAuth() {
    try {
        $token = JWT::getBearerToken();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No autorizado - Token no proporcionado']);
            exit();
        }
        
        $payload = JWT::decode($token);
        return $payload;
        
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado - ' . $e->getMessage()]);
        exit();
    }
}