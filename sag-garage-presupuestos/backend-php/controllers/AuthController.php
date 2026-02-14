<?php
/**
 * Controlador de autenticación
 */

class AuthController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Login - POST /api/auth/login
     */
    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Log para debug
            error_log('LOGIN ATTEMPT - Data received: ' . json_encode($data));
            
            // Aceptar tanto 'username' como 'email'
            $username = $data['username'] ?? $data['email'] ?? null;
            $password = $data['password'] ?? null;
            
            if (!$username || !$password) {
                error_log('LOGIN ERROR - Missing credentials');
                http_response_code(400);
                echo json_encode(['error' => 'Usuario y contraseña son requeridos']);
                return;
            }
            
            error_log('LOGIN - Searching user: ' . $username);
            
            // Buscar usuario por username o email
            $stmt = $this->db->prepare('SELECT * FROM usuarios WHERE username = ? OR email = ? LIMIT 1');
            $stmt->execute([$username, $username]);
            $user = $stmt->fetch();
            
            if (!$user) {
                error_log('LOGIN ERROR - User not found: ' . $username);
                http_response_code(401);
                echo json_encode(['error' => 'Credenciales inválidas']);
                return;
            }
            
            error_log('LOGIN - User found, verifying password');
            
            // Verificar contraseña (el campo es password_hash en la tabla usuarios)
            if (!password_verify($password, $user['password_hash'])) {
                error_log('LOGIN ERROR - Invalid password for user: ' . $username);
                http_response_code(401);
                echo json_encode(['error' => 'Credenciales inválidas']);
                return;
            }
            
            error_log('LOGIN SUCCESS - User authenticated: ' . $username);
            
            // Generar token JWT
            $payload = [
                'userId' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'] ?? $user['email'],
                'role' => $user['rol'], // El campo es 'rol' en la tabla usuarios
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 horas
            ];
            
            $token = JWT::encode($payload);
            
            // Preparar respuesta
            $response = [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'] ?? $user['email'],
                    'name' => $user['nombre_completo'] ?? $user['username'] ?? $user['email'],
                    'role' => $user['rol'] // El campo es 'rol' en la tabla usuarios
                ]
            ];
            
            error_log('LOGIN - Response prepared, sending token');
            echo json_encode($response);
            
        } catch (Exception $e) {
            error_log('LOGIN EXCEPTION - ' . $e->getMessage());
            error_log('LOGIN EXCEPTION - Stack trace: ' . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al procesar login',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Verificar token - GET /api/auth/verify
     */
    public function verify() {
        try {
            error_log('VERIFY - Verifying token...');
            
            $userData = requireAuth();
            
            error_log('VERIFY - Token valid, fetching user data for userId: ' . $userData['userId']);
            
            // Obtener usuario actualizado de la base de datos
            $stmt = $this->db->prepare('SELECT id, email, username, nombre_completo, rol FROM usuarios WHERE id = ? LIMIT 1');
            $stmt->execute([$userData['userId']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                error_log('VERIFY ERROR - User not found: ' . $userData['userId']);
                http_response_code(404);
                echo json_encode(['error' => 'Usuario no encontrado']);
                return;
            }
            
            error_log('VERIFY SUCCESS - User found: ' . $user['username']);
            
            // Retornar información del usuario
            echo json_encode([
                'valid' => true,
                'user' => [
                    'id' => (string)$user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'] ?? $user['email'],
                    'nombre' => $user['nombre_completo'] ?? $user['username'] ?? $user['email'],
                    'rol' => $user['rol']
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('VERIFY ERROR - Exception: ' . $e->getMessage());
            http_response_code(401);
            echo json_encode([
                'valid' => false,
                'error' => 'Token inválido o expirado'
            ]);
        }
    }
    
    /**
     * Obtener usuario actual - GET /api/auth/me
     */
    public function me() {
        try {
            $userData = requireAuth();
            
            // Obtener usuario actualizado de la base de datos
            $stmt = $this->db->prepare('SELECT id, email, nombre_completo, rol FROM usuarios WHERE id = ? LIMIT 1');
            $stmt->execute([$userData['userId']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'Usuario no encontrado']);
                return;
            }
            
            echo json_encode(['user' => $user]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al obtener usuario',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Crear usuario - POST /api/auth/create-user
     * RUTA ABIERTA - NO REQUIERE AUTENTICACIÓN
     */
    public function createUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            error_log('CREATE USER - Data received: ' . json_encode($data));
            
            // Validar campos requeridos
            $username = $data['username'] ?? null;
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $nombre_completo = $data['nombre_completo'] ?? $username;
            $rol = $data['rol'] ?? 'admin';
            
            if (!$username || !$password) {
                error_log('CREATE USER ERROR - Missing required fields');
                http_response_code(400);
                echo json_encode(['error' => 'Username y password son requeridos']);
                return;
            }
            
            // Si no se proporciona email, usar username@saggarage.com
            if (!$email) {
                $email = $username . '@saggarage.com';
            }
            
            // Verificar si el usuario ya existe
            $stmt = $this->db->prepare('SELECT id FROM usuarios WHERE username = ? OR email = ? LIMIT 1');
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                error_log('CREATE USER ERROR - User already exists: ' . $username);
                http_response_code(409);
                echo json_encode(['error' => 'El usuario ya existe']);
                return;
            }
            
            // Hashear contraseña
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            error_log('CREATE USER - Password hashed successfully');
            
            // Insertar usuario
            $stmt = $this->db->prepare('
                INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, activo, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
            ');
            
            $result = $stmt->execute([$username, $email, $password_hash, $nombre_completo, $rol]);
            
            if ($result) {
                $userId = $this->db->lastInsertId();
                error_log('CREATE USER SUCCESS - User created with ID: ' . $userId);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Usuario creado exitosamente',
                    'user' => [
                        'id' => $userId,
                        'username' => $username,
                        'email' => $email,
                        'nombre_completo' => $nombre_completo,
                        'rol' => $rol
                    ],
                    'credentials' => [
                        'username' => $username,
                        'password' => $password,
                        'note' => 'Guarda estas credenciales para hacer login'
                    ]
                ]);
            } else {
                error_log('CREATE USER ERROR - Database error');
                http_response_code(500);
                echo json_encode(['error' => 'Error al crear usuario en la base de datos']);
            }
            
        } catch (Exception $e) {
            error_log('CREATE USER EXCEPTION - ' . $e->getMessage());
            error_log('CREATE USER EXCEPTION - Stack trace: ' . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al crear usuario',
                'message' => $e->getMessage()
            ]);
        }
    }
}
