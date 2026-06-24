const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const isDevelopment = process.env.NODE_ENV === 'development';
const serverUrl = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://huellas-uio.vercel.app/_/backend';

// 1. Definimos los paths manualmente primero
const manualPaths = {
  '/api/auth/register': {
    post: {
      tags: ['auth'],
      summary: 'Registrar usuario',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                nombre_completo: { type: 'string' },
                rol: { type: 'string', enum: ['admin_fundacion', 'rescatista', 'adoptante'] },
              },
              required: ['email', 'password', 'nombre_completo'],
            },
          },
        },
      },
      responses: {
        201: { description: 'Usuario creado' },
        400: { description: 'Error de validación' },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['auth'],
      summary: 'Login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { email: { type: 'string' }, password: { type: 'string' } },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: { description: 'Login OK' },
        401: { description: 'Credenciales inválidas' },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['auth'],
      summary: 'Logout',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Sesión cerrada' }, 401: { description: 'No autorizado' } },
    },
  },
  '/api/auth/update-password': {
    post: {
      tags: ['auth'],
      summary: 'Actualizar contraseña',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                oldPassword: { type: 'string' },
                password: { type: 'string' },
              },
              required: ['oldPassword', 'password'],
            },
          },
        },
      },
      responses: { 200: { description: 'Contraseña actualizada' }, 400: { description: 'Error de validación' } },
    },
  },
  '/api/auth/recuperarClave': {
    post: {
      tags: ['auth'],
      summary: 'Enviar correo de recuperación',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] },
          },
        },
      },
      responses: { 200: { description: 'Se envió el correo (si aplica)' }, 400: { description: 'Bad request' } },
    },
  },
  '/api/auth/recuperarClave/confirm': {
    put: {
      tags: ['auth'],
      summary: 'Confirmar recuperación (set nueva contraseña)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { token: { type: 'string' }, password: { type: 'string', minLength: 6 } },
              required: ['token', 'password'],
            },
          },
        },
      },
      responses: { 200: { description: 'Recuperación OK' }, 400: { description: 'Token inválido o password inválida' } },
    },
  },
  '/api/users/profile': {
    get: {
      tags: ['users'],
      summary: 'Perfil genérico (resuelve rol)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Perfil OK' } },
    },
  },
  '/api/pets/viewAllPets': {
    get: {
      tags: ['pets'],
      summary: 'Listar mascotas (público)',
      responses: { 200: { description: 'OK' } },
    },
  },
  '/api/pets/viewAllPet/{id}': {
    get: {
      tags: ['pets'],
      summary: 'Ver mascota por id (público)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'OK' } },
    },
  },
  '/api/admin/viewUsers': {
    get: {
      tags: ['admin'],
      summary: 'Ver usuarios (admin_fundacion)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'OK' } },
    },
  },
  '/api/admin/viewPets': {
    get: {
      tags: ['admin'],
      summary: 'Ver mascotas (admin_fundacion)',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'OK' } },
    },
  },
};

// 2. Creamos el spec completo en una sola operación inyectando 'paths'
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Huellas UIO API',
      version: '1.0.0',
      description: 'Documentación Swagger/OpenAPI para Huellas UIO (endpoints principales del backend).',
    },
    servers: [
      {
        url: serverUrl,
        description: isDevelopment ? 'Entorno de Desarrollo' : 'Entorno de Producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: manualPaths, // <-- Clave: Se inyecta aquí de manera nativa
  },
  apis: [], // Queda vacío ya que todo es manual
});

// 3. Setup de la ruta sin mutaciones internas
// ... Todo tu objeto manualPaths y swaggerSpec se mantiene igual que antes ...

function setupSwagger(app) {
  // 1. Endpoint que expone tu JSON de especificaciones de forma estática
  app.get('/api-docs/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  // 2. Renderizado manual del HTML usando recursos estáticos externos (CDN)
  // De esta manera Vercel no se confunde con rutas internas ni archivos locales
  app.get('/api-docs', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Huellas UIO API Docs</title>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -webkit-scrollbar; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cloudflare.com"></script>
        <script src="https://cloudflare.com"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/_/backend/api-docs/json", // Consume directo el JSON de tu backend
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "BaseLayout"
            });
          };
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
}

module.exports = { setupSwagger };