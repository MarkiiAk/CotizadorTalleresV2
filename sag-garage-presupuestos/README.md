# 🚗 SAG Garage - Sistema de Presupuestos y Órdenes de Servicio

Sistema profesional de gestión de presupuestos y órdenes de servicio para talleres mecánicos, desarrollado con tecnologías modernas y diseño UX de primer nivel.

## 🌟 Características Principales

### ✨ Interfaz de Usuario
- **Diseño Moderno**: Interfaz limpia y profesional inspirada en los mejores estándares de Silicon Valley
- **Responsive**: Totalmente adaptable a dispositivos móviles, tablets y desktop
- **Animaciones Suaves**: Transiciones y micro-interacciones que mejoran la experiencia
- **Tema Profesional**: Paleta de colores corporativa azul/gris con acentos modernos

### 📋 Gestión de Órdenes
- **Formulario Multi-Sección**: Organizado en secciones claras y lógicas
- **Inspección Visual del Vehículo**: Sistema interactivo para marcar daños en diferentes vistas
- **Medidor de Combustible**: Indicador visual tipo dashboard automotriz
- **Cálculos Automáticos**: Totales, IVA y subtotales calculados en tiempo real
- **Impresión Profesional**: Generación de presupuestos en formato PDF y para impresión

### 🔐 Sistema de Autenticación
- **Login Seguro**: Autenticación con JWT (JSON Web Tokens)
- **Rutas Protegidas**: Control de acceso a páginas según autenticación
- **Sesión Persistente**: Mantiene la sesión del usuario
- **Credenciales de Prueba**:
  - Usuario: `tu_usuario`
  - Contraseña: `tu_password`

### � Dashboard Administrativo
- **Vista de Todas las Órdenes**: Tabla completa con paginación
- **Búsqueda Avanzada**: Busca por cliente, vehículo, folio, o estado
- **Filtros por Estado**: Pendiente, En Proceso, Completado
- **Acciones Rápidas**: Ver, editar, imprimir y eliminar órdenes
- **Estadísticas en Tiempo Real**: Contadores de órdenes por estado

### 📄 Gestión de Garantías
- **Póliza Integrada**: Términos y condiciones de garantía predefinidos
- **Impresión Automática**: Incluida en el presupuesto final
- **30 Días de Cobertura**: Según estándar del taller

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** - Build tool ultra rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Zustand** - State management ligero y moderno
- **React Router DOM** - Navegación y rutas
- **Lucide React** - Iconos modernos y elegantes
- **jsPDF** & **html2canvas** - Generación de PDFs

### Backend
- **Node.js** con Express
- **TypeScript** - Type safety en el backend
- **JWT** - Autenticación segura
- **bcryptjs** - Hash de contraseñas
- **CORS** - Cross-Origin Resource Sharing
- **JSON Database** - Base de datos simple en archivo

## 📁 Estructura del Proyecto

```
sag-garage-presupuestos/
├── backend/                    # Servidor Node.js/Express
│   ├── src/
│   │   ├── controllers/       # Controladores de rutas
│   │   │   ├── authController.ts
│   │   │   └── ordenesController.ts
│   │   ├── middleware/        # Middlewares (auth, etc.)
│   │   │   └── auth.ts
│   │   ├── models/           # Modelos y DB
│   │   │   └── database.ts
│   │   ├── routes/           # Definición de rutas
│   │   │   ├── auth.ts
│   │   │   └── ordenes.ts
│   │   ├── types/            # Tipos TypeScript
│   │   │   └── index.ts
│   │   └── index.ts          # Servidor principal
│   ├── data/                 # Base de datos JSON
│   │   └── ordenes.json
│   ├── .env                  # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── src/                      # Frontend React
│   ├── components/
│   │   ├── sections/        # Secciones del formulario
│   │   │   ├── ClienteSection.tsx
│   │   │   ├── VehiculoSection.tsx
│   │   │   ├── InspeccionSection.tsx
│   │   │   ├── ProblemaSection.tsx
│   │   │   ├── ServiciosSection.tsx
│   │   │   ├── ManoObraSection.tsx
│   │   │   ├── RefaccionesSection.tsx
│   │   │   ├── GarantiaSection.tsx
│   │   │   ├── ResumenSection.tsx
│   │   │   └── index.ts
│   │   ├── ui/              # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── FuelGauge.tsx
│   │   │   └── index.ts
│   │   ├── PDFDocument.tsx
│   │   ├── PrintablePresupuesto.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx
│   ├── pages/               # Páginas principales
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── NuevaOrden.tsx
│   │   └── index.ts
│   ├── services/            # Servicios API
│   │   └── api.ts
│   ├── store/               # State management
│   │   └── usePresupuestoStore.ts
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   ├── constants/           # Constantes
│   │   ├── servicios.ts
│   │   └── garantia.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── start-dev.bat            # Script de inicio desarrollo
├── start.bat                # Script de inicio simple
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+ instalado
- npm o yarn

### Instalación Rápida

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias del Frontend**:
   ```bash
   npm install
   ```

3. **Instalar dependencias del Backend**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Ejecución en Desarrollo

#### Opción 1: Script Automático (Windows)
```bash
# Ejecuta este archivo .bat y todo se iniciará automáticamente
start-dev.bat
```

Este script:
- ✅ Verifica Node.js instalado
- ✅ Instala dependencias automáticamente si faltan
- ✅ Inicia el backend en `http://localhost:3001`
- ✅ Inicia el frontend en `http://localhost:5173`
- ✅ Abre dos ventanas de terminal independientes

#### Opción 2: Manual

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

### Acceso a la Aplicación

1. Abre tu navegador en: `http://localhost:5173`
2. Usa las credenciales de prueba:
   - **Usuario**: `admin@saggarage.com`
   - **Contraseña**: `admin123`

## 📱 Uso del Sistema

### 1. Login
- Ingresa con las credenciales proporcionadas
- El sistema guardará tu sesión

### 2. Dashboard
- Visualiza todas las órdenes de servicio
- Usa la barra de búsqueda para filtrar
- Haz clic en los botones de acción:
  - �️ Ver detalles
  - ✏️ Editar orden
  - 🖨️ Imprimir presupuesto
  - 🗑️ Eliminar orden

### 3. Nueva Orden
- Haz clic en "Nueva Orden" desde el Dashboard
- Completa el formulario sección por sección:
  1. **Datos del Cliente**: Nombre, teléfono, email
  2. **Datos del Vehículo**: Marca, modelo, año, placas, etc.
  3. **Inspección Visual**: Marca daños en la carrocería
  4. **Nivel de Combustible**: Ajusta el indicador
  5. **Problema Reportado**: Describe la falla
  6. **Servicios**: Selecciona servicios predefinidos
  7. **Mano de Obra**: Agrega trabajos con horas y costo
  8. **Refacciones**: Lista de piezas necesarias
  9. **Garantía**: Revisa términos y condiciones
  10. **Resumen**: Verifica totales y genera presupuesto

### 4. Impresión y PDF
- Desde el resumen o el dashboard, haz clic en "Imprimir"
- Se generará un PDF profesional con todos los detalles
- Incluye logo, datos del taller y términos de garantía

## 🎨 Personalización

### Logo del Taller
Reemplaza el logo en `public/logo.png` con tu logo personalizado.

### Colores Corporativos
Modifica los colores en `tailwind.config.js`:
```javascript
colors: {
  primary: '#2563eb',   // Azul principal
  secondary: '#64748b', // Gris secundario
  // ... más colores
}
```

### Información del Taller
Actualiza los datos en:
- `src/components/PrintablePresupuesto.tsx`
- `src/components/PDFDocument.tsx`

### Términos de Garantía
Edita el archivo `src/constants/garantia.ts`

## � Scripts Disponibles

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter
```

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Producción
```

## 🚢 Despliegue a Producción

Ver guía completa en: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Opciones Recomendadas:
1. **Vercel** - Para frontend (React/Vite)
2. **Render** / **Railway** - Para backend (Node.js)
3. **MongoDB Atlas** - Para base de datos en producción

## � Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de datos en backend
- ✅ CORS configurado
- ✅ Variables de entorno para secretos
- ⚠️ **IMPORTANTE**: Cambia el `JWT_SECRET` en producción

## � Troubleshooting

### El backend no inicia
- Verifica que el puerto 3001 esté libre
- Revisa que las dependencias estén instaladas: `cd backend && npm install`

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo
- Revisa la URL en `src/services/api.ts`

### Errores de TypeScript
- Ejecuta `npm install` en ambas carpetas
- Verifica las versiones de Node.js (18+)

### Base de datos no guarda cambios
- Verifica permisos de escritura en `backend/data/`
- El archivo `ordenes.json` debe existir

## � Soporte

Para dudas o problemas:
1. Revisa esta documentación
2. Consulta los comentarios en el código
3. Verifica la consola del navegador y terminal

## 📄 Licencia

Este proyecto es de uso privado para SAG Garage.

## 🎉 Características Futuras Planeadas

- [ ] Envío de presupuestos por email
- [ ] Notificaciones push
- [ ] Calendario de citas
- [ ] Historial de vehículos
- [ ] Estadísticas y reportes
- [ ] Integración con sistemas de facturación
- [ ] App móvil nativa
- [ ] Multi-usuario con roles

---

**Desarrollado con ❤️ para SAG Garage**

*Sistema de gestión profesional para talleres mecánicos del siglo XXI*
