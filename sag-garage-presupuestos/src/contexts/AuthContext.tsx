import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { AuthContextType, Usuario } from '../types';

console.log('🔐 AuthContext inicializado - usando API REST directamente');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Verificando token:', storedToken ? 'existe' : 'no existe');
      
      if (storedToken) {
        try {
          console.log('📡 Verificando token con API...');
          const data = await authAPI.verify();
          console.log('✅ Token válido, usuario:', data.user);
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('❌ Error al verificar token:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string) => {
    console.log('🔐 Intentando login con:', { username });
    try {
      const data = await authAPI.login(username, password);
      console.log('✅ Login exitoso, guardando token');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      console.log('✅ Usuario autenticado:', data.user);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Cerrando sesión...');
    try {
      await authAPI.logout();
      console.log('✅ Logout exitoso en API');
    } catch (error) {
      console.error('❌ Error en logout API:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      console.log('✅ Sesión cerrada localmente');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
