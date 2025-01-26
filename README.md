# Microservicio de Autenticación

## Descripción General

Microservicio de autenticación construido con Node.js, Express y MongoDB, ofreciendo características seguras de gestión de usuarios y autenticación.

## Características

- Registro de usuarios
- Inicio de sesión con Autenticación de Dos Factores (2FA)
- Autenticación basada en JWT
- Gestión de Roles y Permisos (RBAC)
- Seguimiento de Sesiones
- Restablecimiento de Contraseña
- Cifrado Seguro de Contraseñas
- Arquitectura modular y escalable

## Tecnologías

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- bcrypt
- Winston (Registro de Logs)
- Boom (Manejo de Errores)

## Prerequisitos

- Node.js (v14+)
- MongoDB
- npm

## Instalación

```bash
git clone https://github.com/basmonje/api-auth-mongo
cd api-auth-mongo
npm install
```

## Configuración del Entorno

Crea un archivo `.env`:

```
NODE_ENV=development
PORT=4000
MONGODB_DATABASE=<cadena-conexion-mongodb>
SECRET_PASSWORD_APP=<jwt-secreto>
REFRESH_SECRET_APP=<jwt-secreto-refresh>
```

## Flujos de Autenticación

### Registro de Usuario

- Crear usuario con email/username único
- Asignación opcional de rol
- Contraseña cifrada antes de almacenar

### Proceso de Inicio de Sesión

1. Autenticación Email/Contraseña
2. Autenticación de Dos Factores Opcional
   - Código de 6 dígitos generado
   - Expiración de código: 5 minutos

### Gestión de Tokens

- Token de Acceso (expiración 1 hora)
- Token de Refresco (expiración 7 días)
- Tokens almacenados y rastreados en base de datos

## Endpoints API

### Autenticación

- `POST /api/v1/auth/signup`: Registro de usuario
- `POST /api/v1/auth/singin`: Inicio de sesión
- `POST /api/v1/auth/verify`: Autenticación de dos factores
- `POST /api/v1/auth/forgot-password`: Solicitud de restablecimiento
- `POST /api/v1/auth/:token/reset-password`: Restablecimiento
- `POST /api/v1/auth/refresh-token`: Actualización de token

### Gestión de Usuarios

- `GET /api/v1/users`: Listar usuarios
- `GET /api/v1/users/:id`: Detalles de usuario
- `PUT /api/v1/users/:id`: Actualizar usuario
- `DELETE /api/v1/users/:id`: Eliminar usuario
- `POST /api/v1/users/:id/roles`: Asignar roles
- `PUT /api/v1/users/:id/reset-2fa`: Actualizar 2FA
- `PUT /api/v1/users/:id/change-password`: Cambiar contraseña
- `PUT /api/v1/users/:id/status`: Actualizar estado

### Roles y Permisos

- `GET /api/v1/roles`: Listar roles
- `POST /api/v1/roles`: Crear rol
- `GET /api/v1/permissions`: Listar permisos

### Gestión de Sesiones

- `GET /api/v1/sessions`: Listar todas las sesiones (requiere permisos de administrador).
- `GET /api/v1/sessions/:userId/active`: Listar sesiones activas de un usuario.
- `DELETE /api/v1/sessions/:sessionId`: Revocar una sesión específica.
- `DELETE /api/v1/sessions/:userId/all`: Revocar todas las sesiones de un usuario.
<!-- - `POST /api/v1/sessions`: Crear una nueva sesión (puede usarse para sesiones específicas en otros contextos).  -->

## Ejecutar Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Pruebas

```bash
npm test
```

## Licencia

Proyecto bajo Licencia MIT.
