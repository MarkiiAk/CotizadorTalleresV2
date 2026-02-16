import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ElementosInspeccionProvider } from './contexts/ElementosInspeccionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NuevaOrden } from './pages/NuevaOrden';
import { DetalleOrden } from './pages/DetalleOrden';

function App() {
  return (
    <BrowserRouter basename="/n3wv3r510nh1dd3n">
      <ToastProvider>
        <ElementosInspeccionProvider>
          <AuthProvider>
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/nueva-orden"
              element={
                <ProtectedRoute>
                  <NuevaOrden />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orden/:id"
              element={
                <ProtectedRoute>
                  <DetalleOrden />
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto - redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta 404 - redirige al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </AuthProvider>
        </ElementosInspeccionProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
