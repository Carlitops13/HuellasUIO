require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const petsRoutes = require('./routes/pets.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Permite peticiones desde el frontend (Vite)
app.use(express.json()); // Permite procesar cuerpos en formato JSON

// Ruta de diagnóstico inicial
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend de HuellasUIO conectado a Supabase en ejecución'
  });
});

// Registro de rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petsRoutes); // Rutas de mascotas
// Middleware para capturar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor.'
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

module.exports = app;
