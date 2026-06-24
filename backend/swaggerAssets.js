// swaggerAssets.js

function generarHtmlSwaggerOficial(jsonSpec) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Huellas UIO API Docs</title>
      <!-- Estilos oficiales de Swagger UI sin restricciones -->
      <link rel="stylesheet" type="text/css" href="https://cloudflare.com" />
      <style>
        html { box-sizing: border-box; overflow: -webkit-scrollbar; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>

      <!-- Scripts oficiales cargados de forma directa sin flag crossorigin para evitar bloqueos locales de CORS -->
      <script src="https://cloudflare.com"></script>
      <script src="https://cloudflare.com"></script>

      <script>
        window.onload = function() {
          if (typeof SwaggerUIBundle !== 'undefined') {
            const spec = ${JSON.stringify(jsonSpec)};

            window.ui = SwaggerUIBundle({
              spec: spec,
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "BaseLayout",
              persistAuthorization: true 
            });
          } else {
            document.getElementById('swagger-ui').innerHTML = 
              "<div style='color:red; padding:30px; font-family:sans-serif;'><h3>Error: El script de Swagger UI sigue bloqueado por tu navegador o extensiones locales.</h3><p>Prueba abriendo esta URL en una pestaña de Incógnito o revisando tus extensiones de red.</p></div>";
          }
        };
      </script>
    </body>
    </html>
  `;
}

module.exports = { generarHtmlSwaggerOficial };
