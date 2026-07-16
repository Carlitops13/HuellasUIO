# Huellas UIO — Documentación de API

> API REST (Express) del proyecto **Huellas UIO**.

---

## Base URL

- Desarrollo: `http://localhost:3000`
- Producción: (ajustar según despliegue)

Todos los endpoints están bajo el prefijo:

- `/api`

---

## Autenticación (`/api/auth`)

### `POST /api/auth/register`
Registra un usuario en Supabase Auth.

**Body** (JSON):
- `email` (string, requerido)
- `password` (string, requerido)
- `nombre_completo` (string, requerido)
- `rol` (string, opcional: `admin_fundacion | rescatista | adoptante`)

**Responses**:
- `201` OK
- `400` Error de validación

### `POST /api/auth/login`
Inicia sesión con email y password.

**Body**:
- `email`
- `password`

**Responses**:
- `200` OK (retorna `session` y `user` de Supabase)
- `401` credenciales inválidas

### `POST /api/auth/logout`
Cierra sesión.

- Requiere autenticación (`requireAuth`).

**Headers**:
- `Authorization: Bearer <token>`

### `POST /api/auth/update-password`
Actualiza contraseña del usuario autenticado.

- Requiere autenticación.

**Body**:
- `oldPassword` (string, requerido)
- `password` (string, requerido)

### `POST /api/auth/recuperarClave`
Solicita recuperación de contraseña.

**Body**:
- `email` (string, requerido)

En el backend se usa `supabase.auth.resetPasswordForEmail` y redirige a `/recuperarClave` en frontend.

### `PUT /api/auth/recuperarClave/confirm`
Confirma recuperación y fija la nueva contraseña.

**Body**:
- `token` (string, requerido) 
- `password` (string, requerido; min. 6)

---

## Usuarios y perfiles (`/api/users`)

> Nota: el router usa `authorizeRoles(...)` para restringir operaciones.

### Rescatistas
- `GET /api/users/rescatista/viewProfile`
- `PUT /api/users/rescatista/updateProfile`
- `DELETE /api/users/rescatista/deleteProfile`
- `GET /api/users/rescatista/solicitudesRecibidas`
- `PUT /api/users/rescatista/responderSolicitud/:idSolicitud`

### Adoptantes
- `GET /api/users/adoptante/viewProfile`
- `PUT /api/users/adoptante/updateProfile`
- `DELETE /api/users/adoptante/deleteProfile`
- `POST /api/users/adoptante/adoptionRequest`
- `GET /api/users/adoptante/viewAdoptionStatus`
- `GET /api/users/adoptante/myAdoptionRequests`

### Perfil genérico
- `GET /api/users/profile` (resuelve rol consultando base de datos)

---

## Mascotas (`/api/pets`)

### Rutas privadas (Rescatistas)
- `GET /api/pets/viewOurPets`
- `POST /api/pets/addPet`
- `DELETE /api/pets/deletePet/:id`
- `PUT /api/pets/updatePet/:id`
- `GET /api/pets/viewOurPet/:id`

### Subida de imagen (Rescatistas)
- `POST /api/pets/upload`

- Usa `multer` en memoria.
- `multipart/form-data`
- Campo: `imagen`.

### Rutas públicas
- `GET /api/pets/viewAllPets`
- `GET /api/pets/viewAllPet/:id`

---

## Chats (`/api/chats`)

- `POST /api/chats/buscar-crear`

Requiere autenticación.

---

## Administración (`/api/admin`)

> Todas las rutas requieren rol `admin_fundacion`.

### Usuarios
- `GET /api/admin/viewUsers`
- `GET /api/admin/searchUser/:id`
- `POST /api/admin/createUser`
- `PUT /api/admin/updateUser/:id`
- `DELETE /api/admin/deleteUser/:id`
- `PUT /api/admin/suspendAccount/:id`

### Mascotas
- `GET /api/admin/viewPets`
- `DELETE /api/admin/deletePets/:id`

### Adopciones / Auditoría
- `GET /api/admin/viewStateAdoption`
- `GET /api/admin/viewStateAdoption/:id`

---

## Autenticación (token Supabase)

El backend aplica un middleware `requireAuth`/`authorizeRoles`. En la práctica, los clientes envían:

- `Authorization: Bearer <access_token>`

---

## Swagger / OpenAPI

El proyecto actualmente **no incluye Swagger** configurado.

Si deseas Swagger, se puede agregar usando `swagger-ui-express` + `swagger-jsdoc` y documentar rutas/DTOs.

---

## Referencias en el repo

- `backend/server.js` (registro de rutas)
- `backend/routes/*` (endpoints)
- `backend/controllers/*` (lógica)
- `backend/middleware/auth.js` (autorización)

