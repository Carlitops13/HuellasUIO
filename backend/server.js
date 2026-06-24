require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./chats/socket');
const { setupSwagger } = require('./swagger'); // Movido arriba con las importaciones

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const petsRoutes = require('./routes/pets.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Middlewares globales
app.use(cors()); 
app.use(express.json()); 

// Configuración de Swagger (Debe ir ANTES de las rutas 404)
setupSwagger(app);

// Ruta raíz y diagnóstico
app.get('/', (req, res) => {
    res.json({ message: "Servidor de Huellas UIO activo. Accede a /api para el estado de diagnóstico." });
});

app.get('/api', (req, res) => {
    res.json({ status: 'online', message: 'Backend de HuellasUIO conectado a Supabase en ejecución' });
});

// Registro de rutas de la API
app.use('/api/auth', authRoutes);
// app.use('/api/perfiles', perfilesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/chats', chatRoutes);

// Middleware para capturar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

// Inicializar WebSockets
initSocket(server);

// Levantar el servidor
server.listen(PORT, () => {
    console.log(`Servidor y websocket corriendo en el puerto ${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});

module.exports = app;
