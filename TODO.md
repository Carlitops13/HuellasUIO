# TODO - Recuperar contraseña

- [ 

] Backend: agregar controlador `recuperarClave` en `backend/controllers/auth.controller.js`
- [ ] Backend: agregar ruta `POST /api/auth/reucperarClave` en `backend/routes/auth.routes.js`
- [ ] Frontend: agregar servicio `recoverPassword(email)` en `frontend/src/services/authService.js`
- [x] Frontend: conectar el link “¿Olvidaste tu contraseña?” en `frontend/src/components/LoginForms.jsx` con validación de email y llamada al servicio
- [ ] Probar manualmente:

  - [ ] click con email vacío -> error
  - [ ] click con email válido -> success

