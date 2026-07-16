
# 🐾 Huellas UIO: Plataforma de Adopción Comunitaria

## Problema:

En los últimos años, la ciudad de Quito ha experimentado un incremento significativo en la población de perros comunitarios, entendidos como aquellos animales que, sin tener un propietario definido, son alimentados y cuidados parcialmente por miembros de la comunidad. Esta situación plantea diversos desafíos en términos de bienestar animal, salud pública y organización social, debido a la falta de control sistemático sobre su estado sanitario, reproducción y condiciones de vida.

## Objetivo:

Desarrollar una plataforma web para la adopcion de mascotas comunitarias en la ciudad de Quito para controlar la situacion de abandono de la fauna urbana de la ciudad. 

```
📁 HuellasUIO/
├── 📁 Frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── ⚛️ LoginForm.jsx
│   │   │   ├── ⚛️ MascotaForm.jsx
│   │   │   ├── ⚛️ MascotaList.jsx
│   │   │   └── ⚛️ MascotaCard.jsx
│   │   ├── 📁 services/
│   │   │   ├── 🟨 mascotaService.js
│   │   │   ├── 🟨 authService.js
│   │   │   ├── ⚛️ App.jsx
│   │   │   ├── 🎨 index.css
│   │   │   ├── ⚛️ main.jsx
│   │   │   └── 🎨 App.css
│   │   └── 📁 assets/
│   ├── 🟨 vite.config.js
│   ├── 📄 index.html
│   ├── 🔢 package.json
│   ├── 🔢 package-lock.json
│   └── 🟨 eslint.config.js
├── 📁 Backend/
│   ├── 🟨 index.js
│   ├── 🟨 firebase.js
│   ├── 🟨 supabase.js
│   ├── 🔢 serviceAccountKey.json
│   ├── 🔢 package.json
│   └── 🔢 package-lock.json
├── 📄 .gitignore
└── 📄 README.md

```
### 🎨 Diseño del Proyecto Y Mockups
[ ![Figma Icon](https://img.icons8.com/color/24/000000/figma--v1.png) Ver Mockup en Figma](https://www.figma.com/design/5IwfHmU4TdmWZgwkdqqQeH/MockUpHuellasUIO?t=nQJmvUKuchi8QDmD-1)

### Inicio de sesión 
<img width="1347" height="765" alt="image" src="https://github.com/user-attachments/assets/bb6636cc-8c9a-43a9-ac74-9747eabfba15" />


## Admin Edpoints
<img width="1720" height="454" alt="image" src="https://github.com/user-attachments/assets/86c6b137-3f00-4614-8469-fecbe54e9ba5" />

<img width="1822" height="454" alt="image" src="https://github.com/user-attachments/assets/45ec2707-b75f-4ce5-90d1-548a63003771" />

<img width="1856" height="454" alt="image" src="https://github.com/user-attachments/assets/69e568f0-7cd0-4d6b-9c6a-c0d2cfe51189" />

<img width="1468" height="454" alt="image" src="https://github.com/user-attachments/assets/9e44b5d0-4942-4790-bdb8-d7475c702e11" />

<img width="1804" height="454" alt="image" src="https://github.com/user-attachments/assets/2b3755aa-9c31-4fff-a4b1-93608f2b510b" />

<img width="2008" height="454" alt="image" src="https://github.com/user-attachments/assets/73391c68-b7ba-41a8-8993-e55a95865138" />

## Mascotas Edpoints

<img width="1434" height="454" alt="image" src="https://github.com/user-attachments/assets/345fa114-1d19-4436-924c-31fca3fafb1f" />

<img width="1822" height="454" alt="image" src="https://github.com/user-attachments/assets/76be33b9-b284-42ba-91d9-14544c7a4cf4" />

<img width="1602" height="454" alt="image" src="https://github.com/user-attachments/assets/ea1883cb-7b07-4085-b2df-c9285a533995" />

<img width="1990" height="454" alt="image" src="https://github.com/user-attachments/assets/6640d97d-8a10-48ef-adb6-3cf055dc0238" />


## Rescatistas Edpoints

<img width="1788" height="454" alt="image" src="https://github.com/user-attachments/assets/461b40e9-46be-492f-aec1-9769a90505e0" />

<img width="1838" height="492" alt="image" src="https://github.com/user-attachments/assets/e84fc853-f9d9-4b2a-9faf-75cc114993d7" />

<img width="1804" height="492" alt="image" src="https://github.com/user-attachments/assets/4e6df0bd-2567-4d0d-bd7a-b67b19cb581e" />



## Usuarios adoptantes autenticados

<img width="1770" height="492" alt="image" src="https://github.com/user-attachments/assets/51e40f17-6949-4d6d-a197-911e4c9206a9" />

<img width="1822" height="492" alt="image" src="https://github.com/user-attachments/assets/1ac67480-bfb0-470a-9198-024c7ca8f321" />
























---

## Funcionalidades principales (según rol)

> La aplicación muestra diferentes pantallas y acciones dependiendo del rol del usuario autenticado.

### 🐾 Rescatista
- **Ver “Mis Mascotas Rescatadas”**: listado de mascotas registradas por el rescatista.
- **Subir una nueva mascota**: formulario para publicar un rescatado con datos básicos (nombre, especie, edad estimada, género, sector en Quito, rasgos) y **subida de imagen**.
- **Solicitudes de adopción recibidas**: revisión de postulaciones y gestión de estado.
  - **Aprobar** una solicitud.
  - **Rechazar** una solicitud.
  - **Revertir** a estado “pendiente” cuando aplique.

### 🏡 Adoptante
- **Explorar adopciones**: catálogo general con búsqueda (nombre/sector) y filtros por especie.
- **Conocer y postular**: seleccionar una mascota del catálogo y completar el formulario de adopción.
- **Mis solicitudes**: seguimiento del estado de las postulaciones enviadas.

### 🧑‍💼 Administrador
- **Catálogo General**: visualización del conjunto de mascotas registradas en la red.
- **Gestión de Usuarios**:
  - **Registrar usuarios**.
  - **Editar perfiles** (datos como nombre, teléfono, dirección y rol).
  - **Suspender / Reactivar cuentas**.
  - **Eliminar usuarios** (acción irreversible).

---

## Flujo básico de uso (paso a paso)

1. **Ingresar a la aplicación**
   - Si ya tienes sesión activa (token), se muestra el **Dashboard**.
   - Si no, se presenta el **Login**.

2. **Autenticación y redirección al dashboard**
   - El rol se determina desde la información del token/perfil y la interfaz habilita las secciones correspondientes.

3. **Navegar según tu rol**
   - **Rescatista**: explorar sus secciones (mis rescatados, subir mascota, solicitudes recibidas).
   - **Adoptante**: explorar adopciones y enviar solicitudes.
   - **Administrador**: gestionar el catálogo y usuarios.

4. **Acciones clave**
   - **Rescatista**: subir mascota + gestionar solicitudes.
   - **Adoptante**: postular mediante el formulario.
   - **Administrador**: administrar cuentas y estados.

---

## Recuperación de contraseña

La aplicación incluye un flujo de restablecimiento de contraseña:
- La ruta `/recuperarClave` recibe un **token de recuperación** vía hash (`access_token`).
- El usuario define una **nueva contraseña** cumpliendo reglas de seguridad (mínimo 6 caracteres, con mayúscula, minúscula y número).
- La confirmación actualiza la contraseña y redirige al login.

---

## Nota de operación

Esta sección documenta el uso a nivel funcional. Para detalles técnicos (rutas/endpoints, configuración y despliegue), se recomienda revisar las secciones existentes del README y el código del backend/frontend.

---

## Documentación adicional de la API

Para la lista de endpoints y detalles de alto nivel, revisa:
- **`API.md`** (documentación separada de la API)


























