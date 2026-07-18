import { useState, useEffect } from 'react';
import { getAllPets, getOurPets, addPet, deletePet, uploadMascotaImage } from '../services/mascotaService';
import { getSolicitudesRecibidas, responderSolicitudAdopcion, postularAdopcion, getMisSolicitudes, getGenericProfile } from '../services/authService';
import { getAllUsers, createUserAdmin, updateUserAdmin, deleteUserAdmin, toggleSuspendUserAdmin } from '../services/adminService';
import DonationModal from './DonationModal';
import paeLogo from "../assets/pae.png"; 
import ubaLogo from "../assets/uba.png"; 
import luckyLogo from "../assets/lucky.png"; 
import walkingLogo from "../assets/walking.png"; 
import caminoCasaLogo from "../assets/caminoCasa.png"; 
import poliperrosLogo from "../assets/poli.png";
// --- FUNCIONES UTILITARIAS DE MAPEADO ---
const calcularEdadJS = (fechaNacimiento) => {
  if (!fechaNacimiento) return 'Desconocida';
  const hoy = new Date();
  const cumple = new Date(fechaNacimiento);
  let anios = hoy.getFullYear() - cumple.getFullYear();
  let meses = hoy.getMonth() - cumple.getMonth();
  
  if (meses < 0 || (meses === 0 && hoy.getDate() < cumple.getDate())) {
    anios--;
    meses += 12;
  }
  
  if (anios > 0) {
    return `${anios} ${anios === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
};

const mapearMascotaAPI = (m) => ({
  id: m.id,
  nombre: m.nombre || 'Sin nombre',
  tipo: m.especie === 'gato' ? 'Gato' : m.especie === 'perro' ? 'Perro' : 'Otro',
  edad: calcularEdadJS(m.fecha_nacimiento_estimada),
  genero: m.sexo === 'hembra' ? 'Hembra' : 'Macho',
  imagen: m.foto_url || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500',
  ubicacion: m.sector_quito || 'Quito',
  rasgo: m.descripcion || 'Cariñoso',
  rescatista: m.registrado_por_perfil?.nombre_completo || 'Rescatista',
  estadoAdopcion: m.estado_adopcion || 'disponible'
});

const mapearMisSolicitudesAPI = (sol) => ({
  id: sol.id,
  mascotaNombre: sol.mascota?.nombre || 'Mascota',
  tipo: sol.mascota?.especie === 'gato' ? 'Gato' : 'Perro',
  imagen: sol.mascota?.foto_url || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500',
  estado: sol.estado_solicitud === 'pendiente' ? 'Pendiente' : 
          sol.estado_solicitud === 'en_revision' ? 'En Revisión' : 
          sol.estado_solicitud === 'aprobada' ? 'Aprobada' : 'Rechazada',
  fecha: sol.creado_el ? sol.creado_el.split('T')[0] : ''
});

const mapearSolicitudRecibidaAPI = (sol) => ({
  id: sol.id,
  mascotaNombre: sol.mascota?.nombre || 'Mascota',
  adoptanteNombre: sol.adoptante?.nombre_completo || 'Adoptante',
  telefono: sol.adoptante?.telefono || 'No provisto',
  ocupacion: sol.adoptante?.direccion || 'Dirección no provista',
  espacio: sol.tipo_vivienda || 'Casa',
  tieneMascotas: sol.tiene_otras_mascotas ? 'Sí' : 'No',
  motivo: sol.motivo_adopcion || '',
  estado: sol.estado_solicitud === 'pendiente' ? 'Pendiente' : 
          sol.estado_solicitud === 'en_revision' ? 'En Revisión' : 
          sol.estado_solicitud === 'aprobada' ? 'Aprobada' : 'Rechazada',
  fecha: sol.creado_el ? sol.creado_el.split('T')[0] : '',
  imagen: sol.mascota?.foto_url || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500'
});

const renderizarTextoChat = (texto) => {
  if (!texto) return null;

  const partes = texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return partes.map((parte, index) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={`${parte}-${index}`}>{parte.slice(2, -2)}</strong>;
    }

    return <span key={`${parte}-${index}`}>{parte}</span>;
  });
};

export default function DashboardForm({ token, onLogout, onIrAPerfil }) {
  // --- ESTADOS DE CONTROL GENERAL ---
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [rolUsuario, setRolUsuario] = useState(''); 
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [loading, setLoading] = useState(false);
  const [loadingTexto, setLoadingTexto] = useState('Cargando...');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalText, setErrorModalText] = useState('');

  // --- ESTADOS DE MASCOTAS ---
  const [mascotas, setMascotas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');

  // --- ESTADOS DEL FORMULARIO "SUBIR MASCOTA" ---
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('Perro');
  const [edadAnios, setEdadAnios] = useState(0);
  const [edadMeses, setEdadMeses] = useState(0);
  const [nuevoGenero, setNuevoGenero] = useState('Macho');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [nuevoRasgo, setNuevoRasgo] = useState('');
  const [nuevaImagenArchivo, setNuevaImagenArchivo] = useState(null);

  // --- ESTADOS DEL FORMULARIO DE SOLICITUD DE ADOPCIÓN (ADOPTANTE) ---
  const [mascotaParaAdoptar, setMascotaParaAdoptar] = useState(null); 
  const [solicitudTelefono, setSolicitudTelefono] = useState('');
  const [solicitudOcupacion, setSolicitudOcupacion] = useState('');
  const [solicitudTieneMascotas, setSolicitudTieneMascotas] = useState('No');
  const [solicitudEspacio, setSolicitudEspacio] = useState('Casa');
  const [solicitudMotivo, setSolicitudMotivo] = useState('');
  
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  // --- ESTADOS DE GESTIÓN DE USUARIOS (ADMINISTRADOR) ---
  const [usuarios, setUsuarios] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [rolFiltro, setRolFiltro] = useState('Todos');
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null); // null = Crear, object = Editar
  
  // Campos del formulario de usuario
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userNombreCompleto, setUserNombreCompleto] = useState('');
  const [userTelefono, setUserTelefono] = useState('');
  const [userDireccion, setUserDireccion] = useState('');
  const [userRol, setUserRol] = useState('adoptante');
  const [userOrganizacion, setUserOrganizacion] = useState('');

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [destinatarioActual, setDestinatarioActual] = useState({ nombre: '', id: '', tipo: '' });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hola, soy tu asistente de apoyo veterinario. Puedo orientarte con consejos básicos sobre cuidado, alimentación y señales de alerta para buscar atención veterinaria.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatIsLoading, setChatIsLoading] = useState(false);

  const abrirDonacion = (nombre, id, tipo) => {
    setDestinatarioActual({ nombre, id, tipo });
    setIsDonationModalOpen(true);
  };

  const obtenerRespuestaLocal = (texto) => {
    const textoLimpio = texto.toLowerCase();
    let respuesta = 'Gracias por compartirlo. Para una orientación más precisa, te recomiendo consultar con un veterinario. Si notas fiebre, vómitos persistentes, dolor o falta de apetito, busca atención urgente.';

    if (textoLimpio.includes('comida') || textoLimpio.includes('aliment')) {
      respuesta = 'Una dieta balanceada y agua limpia son clave. Evita dar alimentos humanos, chocolate, cebolla o ajo, y consulta al veterinario si hay cambios bruscos en el apetito.';
    } else if (textoLimpio.includes('vacuna') || textoLimpio.includes('vacunas')) {
      respuesta = 'Las vacunas ayudan a prevenir enfermedades. Mantén el calendario al día y consulta al veterinario para ajustar el plan según la edad y el estado de salud.';
    } else if (textoLimpio.includes('herida') || textoLimpio.includes('sangre')) {
      respuesta = 'Si hay una herida abierta, sangrado o dolor intenso, es mejor acudir a una clínica veterinaria lo antes posible.';
    } else if (textoLimpio.includes('baño') || textoLimpio.includes('ducha')) {
      respuesta = 'El baño debe ser suave y con productos adecuados para mascotas. Si tu mascota se muestra muy nerviosa o tiene irritación en la piel, consulta con el veterinario.';
    }

    return respuesta;
  };

  const obtenerRespuestaDelBackend = async (mensajes) => {
    try {
      const BaseURL = import.meta.env.VITE_BASE_URL_PRODUCCION

      const response = await fetch(`${BaseURL}/api/chats/mini-gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ messages: mensajes, modo: 'veterinario' })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo obtener una respuesta del backend');
      }

      return data?.answer || 'No se recibió respuesta del modelo.';
    } catch (error) {
      console.error('Error al contactar el backend del chat:', error);
      return obtenerRespuestaLocal(mensajes[mensajes.length - 1]?.content || '');
    }
  };

  const manejarEnviarMensajeChat = async (e) => {
    e.preventDefault();
    const texto = chatInput.trim();
    if (!texto || chatIsLoading) return;

    const mensajesPrevios = [...chatMessages];
    const nuevoMensajeUsuario = { id: Date.now(), role: 'user', text: texto };
    setChatMessages((prev) => [...prev, nuevoMensajeUsuario]);
    setChatInput('');
    setChatIsLoading(true);

    try {
      const mensajesParaBackend = mensajesPrevios
        .filter((mensaje) => mensaje.role === 'user' || mensaje.role === 'assistant')
        .map((mensaje) => ({
          role: mensaje.role === 'assistant' ? 'assistant' : 'user',
          content: mensaje.text
        }));

      mensajesParaBackend.push({ role: 'user', content: texto });

      const respuesta = await obtenerRespuestaDelBackend(mensajesParaBackend);
      const nuevoMensajeAsistente = { id: Date.now() + 1, role: 'assistant', text: respuesta };
      setChatMessages((prev) => [...prev, nuevoMensajeAsistente]);
    } catch (error) {
      console.error('Error al preparar la respuesta del chat:', error);
      const nuevoMensajeAsistente = {
        id: Date.now() + 2,
        role: 'assistant',
        text: 'No pude responder en este momento. Intenta nuevamente en unos segundos.'
      };
      setChatMessages((prev) => [...prev, nuevoMensajeAsistente]);
    } finally {
      setChatIsLoading(false);
    }
  };

  const limpiarChat = () => {
    setChatMessages([
      {
        id: 1,
        role: 'assistant',
        text: 'Hola, soy tu asistente de apoyo veterinario. Puedo orientarte con consejos básicos sobre cuidado, alimentación y señales de alerta para buscar atención veterinaria.'
      }
    ]);
    setChatInput('');
  };

  // --- FUNCIÓN MOSTRAR MENSAJE ---
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  // --- 1. LEER EL ROL DESDE EL TOKEN Y BASE DE DATOS ---
  useEffect(() => {
    if (!token) return;
    const inicializarUsuario = async () => {
      try {
        let datosUsuario = null;
        if (typeof token === 'string' && (token.startsWith('{') || token.startsWith('['))) {
          datosUsuario = JSON.parse(token);
        } else if (typeof token === 'object') {
          datosUsuario = token;
        } 
        else if (typeof token === 'string' && token.split('.').length === 3) {
          const payloadBase64 = token.split('.')[1];
          const payloadDecodificado = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
          datosUsuario = JSON.parse(payloadDecodificado);
        }

        if (datosUsuario) {
          const userObj = datosUsuario.user || datosUsuario;
          const name = userObj?.user_metadata?.nombre || userObj?.user_metadata?.full_name || userObj?.nombre || userObj?.email;
          if (name) setNombreUsuario(name);

          let rolDetectado = userObj?.user_metadata?.rol || userObj?.user_metadata?.role || userObj?.rol || datosUsuario?.rol;
          if (rolDetectado === 'authenticated') {
            rolDetectado = undefined;
          }
          
          // Si no está el rol en la metadata del token, consultamos la base de datos
          if (!rolDetectado) {
            try {
              const perfil = await getGenericProfile(token);
              rolDetectado = perfil?.rol;
              if (perfil?.nombre_completo) {
                setNombreUsuario(perfil.nombre_completo);
              }
            } catch (profileErr) {
              console.error("Error al obtener perfil genérico en inicialización:", profileErr);
            }
          }

          if (rolDetectado) {
            const rolLimpio = rolDetectado.toString().trim().toLowerCase();
            if (rolLimpio.includes('rescat')) {
              setRolUsuario('rescatista');
              setSeccionActiva('inicio'); 
            } else if (rolLimpio.includes('admin')) {
              setRolUsuario('administrador');
              setSeccionActiva('explorar');
            } else {
              setRolUsuario(rolLimpio);
              setSeccionActiva('explorar'); 
            }
          }
        }
      } catch (error) {
        console.error("Error al procesar el token en el Dashboard:", error);
      }
    };

    inicializarUsuario();
  }, [token]);

  // --- 2. CARGAR DATOS DESDE LA API SEGÚN EL ROL ---
  const cargarDatos = async () => {
    if (!token || !rolUsuario) return;
    setLoadingTexto("Cargando la información...");
    setLoading(true);
    try {
      if (rolUsuario === 'rescatista') {
        // Cargar las mascotas del rescatista (si estamos en inicio) o todas (si estamos en explorar)
        let petsData;
        if (seccionActiva === 'explorar') {
          petsData = await getAllPets();
        } else {
          petsData = await getOurPets(token);
        }
        setMascotas(Array.isArray(petsData) ? petsData : []);

        // Cargar las solicitudes de adopción recibidas
        const solicitudesData = await getSolicitudesRecibidas(token);
        setSolicitudesRecibidas(Array.isArray(solicitudesData) ? solicitudesData.map(mapearSolicitudRecibidaAPI) : []);
      } else if (rolUsuario === 'adoptante') {
        // Cargar todas las mascotas disponibles en la red
        const petsData = await getAllPets();
        setMascotas(Array.isArray(petsData) ? petsData : []);

        // Cargar solicitudes enviadas
        const solicitudesData = await getMisSolicitudes(token);
        setMisSolicitudes(Array.isArray(solicitudesData) ? solicitudesData.map(mapearMisSolicitudesAPI) : []);
      } else if (rolUsuario === 'administrador') {
        // Admin ve todo el catálogo general
        const petsData = await getAllPets();
        setMascotas(Array.isArray(petsData) ? petsData : []);

        // Cargar perfiles de usuario
        try {
          const usersData = await getAllUsers(token);
          setUsuarios(Array.isArray(usersData) ? usersData : []);
        } catch (userErr) {
          console.error("Error al cargar usuarios:", userErr);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos desde API:", error);
      mostrarMensaje("Error al conectar con la base de datos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, rolUsuario, seccionActiva]);

  // FILTRADO GLOBAL (Usando enums del backend)
  const mascotasFiltradas = mascotas.map(mapearMascotaAPI).filter(m => {
    const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSel === 'Todos' || m.tipo === categoriaSel;
    const coincideEstado = seccionActiva !== 'explorar' || m.estadoAdopcion !== 'adoptado';
    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  const misRescatados = mascotasFiltradas;

  // --- ACCIÓN: SUBIR NUEVA MASCOTA ---
  const handleSubirMascota = async (e) => {
    e.preventDefault();
    if (!nuevaImagenArchivo) {
      mostrarMensaje("Por favor, selecciona una foto para la mascota.", "error");
      return;
    }

    setLoadingTexto("Subiendo la foto de la mascota...");
    setLoading(true);
    try {
      // 1. Subir la imagen al storage de Supabase a través de Express
      const uploadResult = await uploadMascotaImage(nuevaImagenArchivo, token);

      if (!uploadResult.ok) {
        const mensajeError = uploadResult.status === 400
          ? 'La imagen no corresponde a un perro o un gato.'
          : uploadResult.error || uploadResult.mensaje || 'Error en el análisis de la imagen.';

        if (uploadResult.status === 400) {
          setErrorModalText(mensajeError);
          setErrorModalOpen(true);
        }

        mostrarMensaje(mensajeError, 'error');
        setLoading(false);
        return;
      }

      const especieSeleccionada = nuevoTipo.toLowerCase() === 'perro' ? 'perro' : nuevoTipo.toLowerCase() === 'gato' ? 'gato' : nuevoTipo.toLowerCase();
      const especieDetectada = uploadResult.tipo?.toLowerCase();

      if (especieDetectada && especieDetectada !== especieSeleccionada) {
        const mensajeError = 'Error: la imagen no corresponde a la especie seleccionada.';
        // Misma UI que el error de imagen no corresponde a un perro o gato
        setErrorModalText(mensajeError);
        setErrorModalOpen(true);

        mostrarMensaje(mensajeError, 'error');
        setLoading(false);
        return;
      }

      if (!uploadResult.url) {
        mostrarMensaje('Error al procesar la imagen. Intenta con otra foto.', 'error');
        setLoading(false);
        return;
      }

      const fotoUrl = uploadResult.url;

      // Calcular la fecha de nacimiento estimada a partir de edadAnios y edadMeses
      const hoy = new Date();
      const fechaEstimada = new Date(hoy.getFullYear() - edadAnios, hoy.getMonth() - edadMeses, 1);
      const yyyy = fechaEstimada.getFullYear();
      const mm = String(fechaEstimada.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaEstimada.getDate()).padStart(2, '0');
      const fechaNacimientoString = `${yyyy}-${mm}-${dd}`;

      setLoadingTexto("Publicando la mascota en el catálogo...");
      // 2. Crear la mascota conectada al backend
      const mascotaData = {
        nombre: nuevoNombre,
        especie: nuevoTipo.toLowerCase() === 'perro' ? 'perro' : nuevoTipo.toLowerCase() === 'gato' ? 'gato' : 'otro',
        fecha_nacimiento_estimada: fechaNacimientoString,
        tamano: 'mediano', // valor por defecto
        sexo: nuevoGenero.toLowerCase() === 'macho' ? 'macho' : 'hembra',
        estado_esterilizacion: true,
        descripcion: nuevoRasgo || 'Un peludito cariñoso en busca de hogar.',
        foto_url: fotoUrl,
        sector_quito: nuevaUbicacion || 'Quito Centro'
      };

      await addPet(mascotaData, token);
      mostrarMensaje("Mascota publicada exitosamente en el sistema.", "success");

      // Limpiar formulario
      setNuevoNombre(''); 
      setEdadAnios(0);
      setEdadMeses(0);
      setNuevaUbicacion(''); 
      setNuevoRasgo(''); 
      setNuevaImagenArchivo(null);
      setSeccionActiva('inicio');
      cargarDatos();
    } catch (error) {
      console.error(error);
      mostrarMensaje(error.message || "Error al subir la mascota.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: ELIMINAR MASCOTA ---
  const handleEliminarMascota = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este rescatado?")) return;
    setLoadingTexto("Eliminando mascota del catálogo...");
    setLoading(true);
    try {
      await deletePet(id, token);
      mostrarMensaje("Mascota eliminada del catálogo.", "success");
      cargarDatos();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al eliminar la mascota.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: RESPONDER SOLICITUD (Aprobar/Rechazar) ---
  const handleCambiarEstadoSolicitud = async (idSolicitud, nuevoEstado) => {
    setLoadingTexto("Guardando la respuesta de la solicitud...");
    setLoading(true);
    try {
      const estadoBD = nuevoEstado === 'Aprobado' ? 'aprobada' : 
                       nuevoEstado === 'Rechazado' ? 'rechazada' : 'pendiente';

      await responderSolicitudAdopcion(idSolicitud, estadoBD, "Actualizado por el rescatista a cargo.", token);
      mostrarMensaje(`Solicitud marcada como ${nuevoEstado} con éxito.`, "success");
      cargarDatos();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al cambiar el estado de la solicitud.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: ENVIAR SOLICITUD DE ADOPCIÓN (Adoptante) ---
  const handleEnviarSolicitud = async (e) => {
    e.preventDefault();
    setLoadingTexto("Enviando tu postulación de adopción...");
    setLoading(true);
    try {
      await postularAdopcion(
        mascotaParaAdoptar.id,
        solicitudMotivo,
        solicitudTieneMascotas === 'Sí',
        solicitudEspacio,
        token
      );
      mostrarMensaje("Postulación enviada. El rescatista revisará tus datos.", "success");

      // Reset
      setSolicitudTelefono(''); 
      setSolicitudOcupacion(''); 
      setSolicitudMotivo('');
      setMascotaParaAdoptar(null);
      setSeccionActiva('mis-solicitudes');
      cargarDatos();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al enviar la solicitud de adopción.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES DE GESTIÓN DE USUARIOS (ADMINISTRADOR) ---
  const abrirModalCrearUsuario = () => {
    setUsuarioEditando(null);
    setUserEmail('');
    setUserPassword('');
    setUserNombreCompleto('');
    setUserTelefono('');
    setUserDireccion('');
    setUserRol('adoptante');
    setUserOrganizacion('');
    setModalUsuarioOpen(true);
  };

  const abrirModalEditarUsuario = (user) => {
    setUsuarioEditando(user);
    setUserEmail(user.email || '');
    setUserPassword('');
    setUserNombreCompleto(user.nombre_completo || '');
    setUserTelefono(user.telefono || '');
    setUserDireccion(user.direccion || '');
    setUserRol(user.rol || 'adoptante');
    setUserOrganizacion(user.nombre_organizacion || '');
    setModalUsuarioOpen(true);
  };

  const handleCrearOEditarUsuario = async (e) => {
    e.preventDefault();
    setLoadingTexto(usuarioEditando ? "Actualizando usuario..." : "Creando usuario...");
    setLoading(true);
    try {
      if (usuarioEditando) {
        const updateData = {
          nombre_completo: userNombreCompleto,
          telefono: userTelefono,
          direccion: userDireccion,
          rol: userRol,
          nombre_organizacion: userRol === 'rescatista' ? userOrganizacion : ''
        };
        await updateUserAdmin(usuarioEditando.id, updateData, token);
        mostrarMensaje("Usuario actualizado correctamente.", "success");
      } else {
        const createData = {
          email: userEmail,
          password: userPassword,
          nombre_completo: userNombreCompleto,
          rol: userRol
        };
        await createUserAdmin(createData, token);
        mostrarMensaje("Usuario registrado correctamente.", "success");
      }
      setModalUsuarioOpen(false);
      cargarDatos();
    } catch (err) {
      console.error(err);
      mostrarMensaje(err.message || "Error al procesar la solicitud de usuario.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBaneoUsuario = async (id, suspendido) => {
    const action = suspendido ? 'reactivate' : 'suspend';
    const actionText = suspendido ? 'reactivar' : 'suspender';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} la cuenta de este usuario?`)) return;

    setLoadingTexto(`${suspendido ? 'Reactivando' : 'Suspendiendo'} cuenta...`);
    setLoading(true);
    try {
      await toggleSuspendUserAdmin(id, action, token);
      mostrarMensaje(`Cuenta ${suspendido ? 'reactivada' : 'suspendida'} exitosamente.`, "success");
      cargarDatos();
    } catch (err) {
      console.error(err);
      mostrarMensaje(err.message || "Error al cambiar el estado de la cuenta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente este usuario? Esta acción es irreversible.")) return;

    setLoadingTexto("Eliminando usuario permanentemente...");
    setLoading(true);
    try {
      await deleteUserAdmin(id, token);
      mostrarMensaje("Usuario eliminado de forma permanente.", "success");
      cargarDatos();
    } catch (err) {
      console.error(err);
      mostrarMensaje(err.message || "Error al eliminar el usuario.", "error");
    } finally {
      setLoading(false);
    }
  };


  // --- COMPONENTE INTERNO: GESTIÓN DE USUARIOS (ADMINISTRADOR) ---
  const renderGestionUsuarios = () => {
    const total = usuarios.length;
    const adoptantesCount = usuarios.filter(u => u.rol === 'adoptante').length;
    const rescatistasCount = usuarios.filter(u => u.rol === 'rescatista').length;
    const adminsCount = usuarios.filter(u => u.rol === 'admin_fundacion').length;

    const usuariosFiltrados = usuarios.filter(u => {
      const coincideBusqueda = 
        (u.nombre_completo || '').toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(busquedaUsuario.toLowerCase());
      
      const coincideRol = 
        rolFiltro === 'Todos' ||
        (rolFiltro === 'Adoptantes' && u.rol === 'adoptante') ||
        (rolFiltro === 'Rescatistas' && u.rol === 'rescatista') ||
        (rolFiltro === 'Administradores' && u.rol === 'admin_fundacion');

      return coincideBusqueda && coincideRol;
    });

    return (
      <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
        {/* Cabecera de Sección */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl text-[#9d3d2c] font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Gestión de Usuarios</h2>
            <p className="text-[#89726d] text-xs font-semibold">Administra cuentas, roles y accesos del personal y adoptantes.</p>
          </div>
          <button 
            onClick={abrirModalCrearUsuario}
            className="bg-[#9d3d2c] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#802919] shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">person_add</span> Registrar Usuario
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#9d3d2c]/10 text-[#9d3d2c] flex-shrink-0"><span className="material-symbols-outlined text-2xl">group</span></div>
            <div>
              <span className="text-[10px] font-bold text-[#89726d] uppercase block">Total Usuarios</span>
              <span className="text-xl font-bold text-[#1c1c19]">{total}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0"><span className="material-symbols-outlined text-2xl">volunteer_activism</span></div>
            <div>
              <span className="text-[10px] font-bold text-[#89726d] uppercase block">Adoptantes</span>
              <span className="text-xl font-bold text-[#1c1c19]">{adoptantesCount}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 flex-shrink-0"><span className="material-symbols-outlined text-2xl">diversity_1</span></div>
            <div>
              <span className="text-[10px] font-bold text-[#89726d] uppercase block">Rescatistas</span>
              <span className="text-xl font-bold text-[#1c1c19]">{rescatistasCount}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 flex-shrink-0"><span className="material-symbols-outlined text-2xl">shield_person</span></div>
            <div>
              <span className="text-[10px] font-bold text-[#89726d] uppercase block">Fundación Admins</span>
              <span className="text-xl font-bold text-[#1c1c19]">{adminsCount}</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-stretch">
          <div className="relative max-w-md w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] text-lg">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#ffffff] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] outline-none text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Todos', 'Adoptantes', 'Rescatistas', 'Administradores'].map((filtro) => (
              <button
                key={filtro}
                onClick={() => setRolFiltro(filtro)}
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${rolFiltro === filtro ? 'bg-[#9d3d2c] border-[#9d3d2c] text-white shadow-md' : 'bg-white border-[#ddc0bb] text-[#56423e] hover:border-[#9d3d2c]'}`}
              >
                {filtro}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Usuarios */}
        {usuariosFiltrados.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm max-w-md">
            <span className="material-symbols-outlined text-4xl text-[#89726d] mb-2">person_off</span>
            <p className="text-[#89726d] font-semibold">No se encontraron usuarios registrados con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {usuariosFiltrados.map((u) => {
              const esBaneado = !!u.suspendido;
              const iniciales = (u.nombre_completo || 'U')
                .split(' ')
                .slice(0, 2)
                .map(n => n[0])
                .join('')
                .toUpperCase();

              return (
                <div key={u.id} className={`bg-white rounded-3xl border border-[#ddc0bb]/30 shadow-md p-6 flex flex-col justify-between transition-all hover:shadow-lg ${esBaneado ? 'opacity-70 border-rose-200 bg-rose-50/10' : ''}`}>
                  <div>
                    {/* Fila Superior */}
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${
                          u.rol === 'admin_fundacion' ? 'bg-rose-50 text-rose-700' :
                          u.rol === 'rescatista' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {iniciales}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1c1c19] text-sm leading-tight" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            {u.nombre_completo || 'Usuario de Huellas'}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block uppercase ${
                            u.rol === 'admin_fundacion' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            u.rol === 'rescatista' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {u.rol === 'admin_fundacion' ? 'Admin Fundación' : u.rol === 'rescatista' ? 'Rescatista' : 'Adoptante'}
                          </span>
                        </div>
                      </div>

                      {/* Estado */}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        esBaneado ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {esBaneado ? 'Suspendido' : 'Activo'}
                      </span>
                    </div>

                    {/* Datos del usuario */}
                    <div className="space-y-2 mb-6 text-xs text-[#56423e]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#89726d] flex-shrink-0">mail</span>
                        <span className="truncate">{u.email || 'Sin correo registrado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#89726d] flex-shrink-0">phone</span>
                        <span>{u.telefono || 'Sin teléfono'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#89726d] flex-shrink-0">home</span>
                        <span className="truncate" title={u.direccion}>{u.direccion || 'Sin dirección registrada'}</span>
                      </div>
                      {u.rol === 'rescatista' && u.nombre_organizacion && (
                        <div className="flex items-center gap-2 pt-1 border-t border-[#f7f3ee]">
                          <span className="material-symbols-outlined text-sm text-[#89726d] flex-shrink-0">domain</span>
                          <span className="font-semibold truncate">{u.nombre_organizacion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1.5 border-t border-[#f7f3ee] pt-4">
                    <button 
                      onClick={() => abrirModalEditarUsuario(u)}
                      className="flex-1 bg-white hover:bg-[#f7f3ee] border border-[#ddc0bb] text-[#56423e] py-2 rounded-full font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                    <button 
                      onClick={() => handleToggleBaneoUsuario(u.id, esBaneado)}
                      className={`flex-1 border py-2 rounded-full font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        esBaneado 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{esBaneado ? 'check_circle' : 'block'}</span> 
                      {esBaneado ? 'Reactivar' : 'Suspender'}
                    </button>
                    <button 
                      onClick={() => handleEliminarUsuario(u.id)}
                      className="p-2 border border-rose-200 text-rose-600 rounded-full hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      title="Eliminar permanentemente"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // --- COMPONENTE INTERNO: CATÁLOGO DE ADOPCIONES ---
  const renderCatalogoAdopciones = () => (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <div className="space-y-4 mb-8">
        <div className="relative max-w-md w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#89726d] group-focus-within:text-[#9d3d2c] text-lg">search</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre o sector..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#ffffff] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 transition-all text-[#1c1c19] outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Todos', 'Perro', 'Gato'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${categoriaSel === cat ? 'bg-[#9d3d2c] border-[#9d3d2c] text-white shadow-md' : 'bg-white border-[#ddc0bb] text-[#56423e] hover:border-[#9d3d2c]'}`}
            >
              {cat === 'Todos' ? ' Todos' : cat === 'Perro' ? 'Perros' : 'Gatos'}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-xl text-[#9d3d2c] mb-6 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Catálogo General de Mascotas ({mascotasFiltradas.length})</h2>
      
      {mascotasFiltradas.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm max-w-md">
          <p className="text-[#89726d] font-semibold">No se encontraron mascotas en esta categoría o sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mascotasFiltradas.map((m) => (
            <div key={m.id} className="bg-white rounded-3xl overflow-hidden border border-[#ddc0bb]/30 shadow-md flex flex-col justify-between">
              <div 
                onClick={() => setFotoAmpliada({ url: m.imagen, nombre: m.nombre })}
                className="relative aspect-square overflow-hidden bg-[#f7f3ee] group cursor-pointer"
              >
                <img 
                  src={m.imagen} 
                  alt={m.nombre} 
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#1c1c19] text-base" style={{ fontFamily: "'Quicksand', sans-serif" }}>{m.nombre}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${m.genero === 'Macho' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{m.genero}</span>
                </div>
                <p className="text-xs text-[#89726d] mb-1 font-semibold">{m.ubicacion} • {m.rasgo}</p>
                <p className="text-xs text-[#56423e] font-medium mb-4">Edad: {m.edad}</p>
                {rolUsuario === 'adoptante' && (
                  <button 
                    onClick={() => setMascotaParaAdoptar(m)}
                    className="w-full bg-[#9d3d2c] text-white font-bold py-2 rounded-full text-xs hover:bg-[#802919] transition-all"
                  >
                    Conocer más / Adoptar
                  </button>
                )}
                {/* Botón de Donar a Mascota (Nuevo) */}
                {/* Puedes añadir una condición aquí: m.requiere_donacion ? (...) : null */}
                <button 
                 onClick={() => abrirDonacion(m.nombre, m.id, 'mascota')}
                 className="w-full bg-[#f7f3ee] text-[#9d3d2c] border border-[#9d3d2c] font-bold py-2 rounded-full text-xs hover:bg-[#9d3d2c] hover:text-white transition-all"
                >
                Donar a {m.nombre}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFundaciones = () => {
    const listaFundaciones = [
      { id: 'f1', nombre: 'Fundación PAE', img: paeLogo },
      { id: 'f2', nombre: 'UBA', img: ubaLogo },
      { id: 'f3', nombre: 'Lucky Bienestar', img: luckyLogo },
      { id: 'f4', nombre: 'Walking Dog', img: walkingLogo },
      { id: 'f5', nombre: 'Camino a Casa', img: caminoCasaLogo },
      { id: 'f6', nombre: 'Poliperros', img: poliperrosLogo }
    ];

    return (
      <div className="mt-12 mb-16">
        <h2 className="text-2xl text-[#9d3d2c] mb-8 font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Fundaciones Aliadas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listaFundaciones.map((f) => (
            <div key={f.id} className="bg-white p-6 rounded-[2rem] border border-[#ddc0bb]/30 shadow-lg flex items-center gap-4">
              <div className="w-16 h-16 bg-[#fdf9f4] rounded-full flex items-center justify-center border border-[#ddc0bb]/20">
                <img src={f.img} alt={f.nombre} className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-[#1c1c19] text-base mb-1">{f.nombre}</h3>
                <p className="text-[#89726d] text-xs">Apoya la labor de rescate y alimentación de esta fundación.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fdf9f4] text-[#1c1c19] flex overflow-x-hidden selection:bg-[#ffdad3]">
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      {/* --- CARGANDO PANTALLA COMPLETA --- */}
      {loading && (
        <div className="fixed inset-0 bg-[#fdf9f4]/70 backdrop-blur-md z-50 flex items-center justify-center transition-all duration-300">
          <div className="bg-white/95 border border-[#ddc0bb]/40 shadow-2xl rounded-3xl p-8 flex flex-col items-center max-w-xs text-center">
            {/* Contenedor de patita giratoria */}
            <div className="relative flex items-center justify-center w-20 h-20 mb-4">
              {/* Borde exterior giratorio */}
              <div className="absolute inset-0 border-4 border-[#ffdad3] border-t-[#9d3d2c] rounded-full animate-spin"></div>
              {/* Icono de huellita parpadeante */}
              <span className="material-symbols-outlined text-[#9d3d2c] text-4xl animate-pulse">
                pets
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-[#1c1c19] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Un momento
            </h3>
            <p className="text-sm text-[#56423e] font-semibold" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
              {loadingTexto}
            </p>
          </div>
        </div>
      )}

      {/* ================= BARRA LATERAL (SIDEBAR) ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#ddc0bb]/30 transform ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col justify-between shadow-sm`}>
        <div>
          <div className="p-6 flex items-center justify-between border-b border-[#f7f3ee]">
            <div className="text-2xl text-[#9d3d2c] tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Huellas UIO</div>
            <button className="md:hidden text-[#89726d]" onClick={() => setSidebarAbierto(false)}><span className="material-symbols-outlined">close</span></button>
          </div>

          <nav className="p-4 space-y-1.5" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {(rolUsuario === 'adoptante' || rolUsuario === 'administrador') && (
              <>
                <button onClick={() => setSeccionActiva('explorar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'explorar' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">pets</span> {rolUsuario === 'administrador' ? 'Catálogo General' : 'Adoptar Mascota'}</button>
                {rolUsuario === 'administrador' && (
                  <button onClick={() => setSeccionActiva('usuarios')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'usuarios' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">manage_accounts</span> Gestionar Usuarios</button>
                )}
                {rolUsuario==='administrador' && (
                  <button onClick={()=> setSeccionActiva('chatbot')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'chatbot' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">smart_toy</span> Chatbot </button>
                )}
                {rolUsuario === 'adoptante' && (
                  <button onClick={() => setSeccionActiva('mis-solicitudes')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'mis-solicitudes' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">description</span> Mis Solicitudes</button>
                )}
                  {rolUsuario==='adoptante' && (
                  <button onClick={()=> setSeccionActiva('chatbot')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'chatbot' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">smart_toy</span> Chatbot </button>
                )}
                
              </>
            )}

            {rolUsuario === 'rescatista' && (
              <>
                <button onClick={() => setSeccionActiva('inicio')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'inicio' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">home_pin</span> Mis Rescatados</button>
                <button onClick={() => setSeccionActiva('explorar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'explorar' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">travel_explore</span> Explorar Adopciones</button>
                <button onClick={() => setSeccionActiva('subir-mascota')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'subir-mascota' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">add_circle</span> Subir Mascota</button>
                <button onClick={() => setSeccionActiva('solicitudes-recibidas')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'solicitudes-recibidas' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">mail</span> Solicitudes Recibidas</button>
                <button onClick={()=> setSeccionActiva('chatbot')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'chatbot' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">smart_toy</span> Chatbot </button>
              </>
            )}

            <button onClick={onIrAPerfil} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#56423e] hover:bg-[#f7f3ee] font-bold text-sm text-left border-t border-[#f7f3ee] pt-4 mt-2"><span className="material-symbols-outlined text-lg">account_circle</span> Mi Perfil</button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#f7f3ee]">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#9d3d2c] hover:bg-rose-50 font-bold text-sm text-left transition-colors"><span className="material-symbols-outlined text-lg">logout</span> Cerrar Sesión</button>
        </div>
      </aside>

      {/* ================= CONTENIDO CENTRAL ================= */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-12">
        <header className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarAbierto(true)} className="p-2 bg-white rounded-xl border border-[#ddc0bb]/50 text-[#56423e] flex items-center"><span className="material-symbols-outlined">menu</span></button>
          <span className="text-xl text-[#9d3d2c] font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Huellas UIO</span>
        </header>

        {/* --- BANNER DE NOTIFICACIONES --- */}
        {mensaje.texto && (
          <div className={`p-4 mb-6 rounded-xl text-xs font-bold text-center border ${
            mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl text-[#9d3d2c] font-bold tracking-tight mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>¡Hola, {nombreUsuario}! </h1>
          <p className="text-[#89726d] text-xs font-bold uppercase tracking-widest bg-[#ffdad3]/40 text-[#9d3d2c] inline-block px-3 py-1 rounded-md" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Rol actual: {rolUsuario}</p>
        </div>

        {seccionActiva === 'explorar' && (
          <>
            {renderCatalogoAdopciones()}
            {renderFundaciones()}
          </>
        )}
        {seccionActiva === 'usuarios' && rolUsuario === 'administrador' && renderGestionUsuarios()}
        {/* ================= VISTA: MIS RESCATADOS ================= */}
        {seccionActiva === 'inicio' && rolUsuario === 'rescatista' && (
          <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-[#9d3d2c] font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Mis Mascotas Rescatadas</h2>
              <button 
                onClick={() => setSeccionActiva('subir-mascota')}
                className="bg-[#9d3d2c] text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#802919] shadow-md transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Registrar Nuevo
              </button>
            </div>

            {misRescatados.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm max-w-md">
                <p className="text-[#89726d] font-semibold">No tienes animalitos registrados todavía en la red.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {misRescatados.map((m) => (
                  <div key={m.id} className="bg-white rounded-3xl overflow-hidden border border-[#ddc0bb]/30 shadow-md flex flex-col justify-between group">
                    <div 
                      onClick={() => setFotoAmpliada({ url: m.imagen, nombre: m.nombre })}
                      className="relative aspect-square overflow-hidden bg-[#f7f3ee] group cursor-pointer"
                    >
                      <img 
                        src={m.imagen} 
                        alt={m.nombre} 
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                      />
                      <span className="absolute bottom-3 left-3 bg-[#9d3d2c] text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">Tuyo</span>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[#1c1c19] text-base" style={{ fontFamily: "'Quicksand', sans-serif" }}>{m.nombre}</h3>
                        {m.estadoAdopcion === 'adoptado' ? (
                          <span className="text-[10px] bg-gray-50 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">Adoptado</span>
                        ) : m.estadoAdopcion === 'en_proceso' ? (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">En proceso</span>
                        ) : m.estadoAdopcion === 'comunitario_monitoreado' ? (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">Monitoreado</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Disponible</span>
                        )}
                      </div>
                      <p className="text-xs text-[#89726d] mb-1">{m.ubicacion} • {m.rasgo}</p>
                      <p className="text-xs text-[#56423e] font-medium mb-4">Edad: {m.edad}</p>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-[#ddc0bb] text-[#56423e] font-bold rounded-full text-xs hover:bg-[#f7f3ee]">Editar</button>
                        <button 
                          onClick={() => handleEliminarMascota(m.id)}
                          className="p-2 border border-rose-200 text-rose-600 rounded-full hover:bg-rose-50 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: SUBIR MASCOTA (CON SELECTOR DE ARCHIVO LOCAL) ================= */}
        {seccionActiva === 'subir-mascota' && (
          <div className="max-w-xl bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 shadow-xl" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <h2 className="text-2xl text-[#9d3d2c] font-bold mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>Subir Mascota a Huellas UIO</h2>
            <p className="text-[#89726d] text-xs font-semibold mb-6">Ingresa los datos del peludito rescatado para publicarlo en la red de adopción.</p>

            <form onSubmit={handleSubirMascota} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Nombre de la Mascota</label>
                  <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required placeholder="Ej: Terry" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Especie</label>
                  <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm cursor-pointer">
                    <option value="Perro"> Perro</option>
                    <option value="Gato"> Gato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Edad Estimada</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-[#f7f3ee] px-2.5 py-2 rounded-xl border border-[#ddc0bb]">
                      <select 
                        value={edadAnios} 
                        onChange={(e) => setEdadAnios(parseInt(e.target.value) || 0)} 
                        className="bg-transparent border-none outline-none text-sm w-full cursor-pointer"
                      >
                        {Array.from({ length: 21 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                      <span className="text-xs text-[#89726d] font-bold pr-1">años</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#f7f3ee] px-2.5 py-2 rounded-xl border border-[#ddc0bb]">
                      <select 
                        value={edadMeses} 
                        onChange={(e) => setEdadMeses(parseInt(e.target.value) || 0)} 
                        className="bg-transparent border-none outline-none text-sm w-full cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                      <span className="text-xs text-[#89726d] font-bold pr-1">meses</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Género</label>
                  <select value={nuevoGenero} onChange={(e) => setNuevoGenero(e.target.value)} className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm cursor-pointer">
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">Sector o Ubicación (Quito)</label>
                <input type="text" value={nuevaUbicacion} onChange={(e) => setNuevaUbicacion(e.target.value)} required placeholder="Ej: Carcelén, El Recreo, Tumbaco" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">Rasgo o Personalidad Corta</label>
                <input type="text" value={nuevoRasgo} onChange={(e) => setNuevoRasgo(e.target.value)} placeholder="Ej: Muy juguetón, tímido, ideal para niños" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
              </div>

              {/* Selector de foto desde la PC */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">Foto de la Mascota (Subir desde el computador)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNuevaImagenArchivo(e.target.files[0])} 
                  required
                  className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#9d3d2c]/10 file:text-[#9d3d2c] hover:file:bg-[#9d3d2c]/20" 
                />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-lg">check_circle</span> Publicar Mascota
              </button>
            </form>
          </div>
        )}

        {/* ================= VISTA: MIS SOLICITUDES ENVIADAS (Adoptante) ================= */}
        {seccionActiva === 'mis-solicitudes' && (
          <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <h2 className="text-2xl text-[#9d3d2c] font-bold mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>Tus Procesos de Adopción</h2>
            
            {misSolicitudes.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm max-w-md">
                <p className="text-[#89726d] font-semibold">Aún no has postulado a ninguna adopción.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {misSolicitudes.map((sol) => (
                  <div key={sol.id} className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-md flex items-center gap-4">
                    <div 
                      onClick={() => setFotoAmpliada({ url: sol.imagen, nombre: sol.mascotaNombre })}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f7f3ee] flex-shrink-0 group cursor-pointer"
                    >
                      <img 
                        src={sol.imagen} 
                        alt={sol.mascotaNombre} 
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base text-[#1c1c19]" style={{ fontFamily: "'Quicksand', sans-serif" }}>{sol.mascotaNombre}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          sol.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                          sol.estado === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {sol.estado}
                        </span>
                      </div>
                      <p className="text-xs text-[#89726d] mt-1">Especie: {sol.tipo} • Código: #{sol.id.toString().slice(-4)}</p>
                      <p className="text-[11px] text-[#56423e] mt-2 font-medium">Postulado el: {sol.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: SOLICITUDES RECIBIDAS (RESCATISTA) ================= */}
        {seccionActiva === 'solicitudes-recibidas' && (
          <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <h2 className="text-2xl text-[#9d3d2c] font-bold mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>Formularios de Adopción Recibidos</h2>
            <p className="text-[#89726d] text-xs font-semibold mb-6">Evalúa el perfil de los adoptantes postulados para tus peluditos rescatados.</p>

            {solicitudesRecibidas.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm max-w-md">
                <p className="text-[#89726d] font-semibold">No has recibido formularios de adopción todavía.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {solicitudesRecibidas.map((sol) => (
                  <div key={sol.id} className="bg-white p-6 rounded-3xl border border-[#ddc0bb]/30 shadow-md flex flex-col md:flex-row gap-6 justify-between">
                    
                    {/* Izquierda: Info de la Mascota e Interesado */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start flex-1">
                      <div 
                        onClick={() => setFotoAmpliada({ url: sol.imagen, nombre: sol.mascotaNombre })}
                        className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f7f3ee] flex-shrink-0 border border-[#ddc0bb]/20 group cursor-pointer"
                      >
                        <img 
                          src={sol.imagen} 
                          alt={sol.mascotaNombre} 
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-[#1c1c19]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            Postulación por {sol.mascotaNombre}
                          </h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            sol.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            sol.estado === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {sol.estado}
                          </span>
                        </div>
                        <p className="text-sm text-[#9d3d2c] font-bold">Interesado: {sol.adoptanteNombre}</p>
                        <p className="text-xs text-[#56423e] font-medium"> Teléfono: {sol.telefono} | Dirección: {sol.ocupacion}</p>
                        <p className="text-xs text-[#56423e] font-medium"> Vivienda: {sol.espacio} | Otras Mascotas: {sol.tieneMascotas}</p>
                        
                        <div className="bg-[#f7f3ee] p-3 rounded-xl border border-[#ddc0bb]/20 mt-2">
                          <p className="text-xs text-[#56423e] italic leading-relaxed">" {sol.motivo} "</p>
                        </div>
                        <p className="text-[10px] text-[#89726d] font-semibold pt-1">Recibido el: {sol.fecha}</p>
                      </div>
                    </div>

                    {/* Derecha: Botones de Gestión de Estados en Caliente */}
                    <div className="flex md:flex-col justify-end items-center gap-2 min-w-[120px]">
                      {sol.estado === 'Pendiente' ? (
                        <>
                          <button 
                            onClick={() => handleCambiarEstadoSolicitud(sol.id, 'Aprobado')}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2 px-4 rounded-full text-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check</span> Aprobar
                          </button>
                          <button 
                            onClick={() => handleCambiarEstadoSolicitud(sol.id, 'Rechazado')}
                            className="w-full border border-rose-200 text-rose-600 font-bold py-2 px-4 rounded-full text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">close</span> Rechazar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleCambiarEstadoSolicitud(sol.id, 'Pendiente')}
                          className="w-full border border-[#ddc0bb] text-[#56423e] font-bold py-1.5 px-4 rounded-full text-xs hover:bg-[#f7f3ee] transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">restart_alt</span> Revertir
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {seccionActiva === 'chatbot' && (
          <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="bg-white rounded-[2rem] border border-[#ddc0bb]/30 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-80">Asistencia</p>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Modo veterinario</h2>
                    <p className="text-sm mt-1 text-[#ffdad3]">Consulta consejos básicos y orientación rápida para el cuidado de tus mascotas.</p>
                    
                  </div>
                  <button
                    onClick={limpiarChat}
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-all"
                  >
                    Limpiar chat
                  </button>
                </div>
              </div>

              <div className="p-5 md:p-6 bg-[#fdf9f4]">
                <div className="bg-white border border-[#ddc0bb]/30 rounded-[1.5rem] p-4 md:p-5 h-[460px] flex flex-col">
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words ${message.role === 'user' ? 'bg-[#9d3d2c] text-white' : 'bg-[#f7f3ee] text-[#56423e] border border-[#ddc0bb]/20'}`}>
                          <p className="font-semibold text-[10px] uppercase tracking-[0.25em] mb-1">
                            {message.role === 'user' ? 'Tú' : 'Veterinario'}
                          </p>
                          <div className="leading-relaxed whitespace-pre-wrap">
                            {renderizarTextoChat(message.text)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {chatIsLoading && (
                      <div className="w-full flex justify-start">
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-[#f7f3ee] text-[#56423e] border border-[#ddc0bb]/20 break-words">
                          <p className="font-semibold text-[10px] uppercase tracking-[0.25em] mb-1">Veterinario</p>
                          <div className="leading-relaxed whitespace-pre-wrap">Estoy pensando una respuesta para ti...</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-[#ddc0bb]/20 pt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['¿Qué alimento le doy?', '¿Cuándo debo llevarlo al veterinario?', 'Tiene una herida'].map((sugerencia) => (
                        <button
                          key={sugerencia}
                          onClick={() => setChatInput(sugerencia)}
                          className="rounded-full border border-[#ddc0bb] bg-[#f7f3ee] px-3 py-1.5 text-xs font-semibold text-[#9d3d2c] hover:bg-[#ffdad3]/40 transition-colors"
                        >
                          {sugerencia}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={manejarEnviarMensajeChat} className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escribe tu consulta para el modo veterinario..."
                        disabled={chatIsLoading}
                        className="flex-1 px-4 py-3 rounded-full border border-[#ddc0bb] bg-[#f7f3ee] focus:border-[#9d3d2c] focus:ring-4 focus:ring-[#9d3d2c]/10 outline-none text-sm disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={chatIsLoading}
                        className="bg-[#9d3d2c] text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-[#802919] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        {chatIsLoading ? 'Enviando...' : 'Enviar'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL INTERACTIVO: FORMULARIO DE SOLICITUD ================= */}
      {mascotaParaAdoptar && (
        <div className="fixed inset-0 z-50 bg-[#1c1c19]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#ddc0bb]/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="p-6 bg-[#fdf9f4] border-b border-[#ddc0bb]/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f7f3ee]">
                  <img src={mascotaParaAdoptar.imagen} alt={mascotaParaAdoptar.nombre} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg text-[#9d3d2c] font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Formulario de Adopción</h3>
                  <p className="text-xs text-[#89726d]">Postulación para adoptar a <b>{mascotaParaAdoptar.nombre}</b></p>
                </div>
              </div>
              <button onClick={() => setMascotaParaAdoptar(null)} className="p-1 text-[#89726d] hover:text-[#9d3d2c] flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleEnviarSolicitud} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Teléfono de Contacto</label>
                  <input type="tel" required value={solicitudTelefono} onChange={(e) => setSolicitudTelefono(e.target.value)} placeholder="Ej: 0987654321" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Ocupación / Profesión</label>
                  <input type="text" required value={solicitudOcupacion} onChange={(e) => setSolicitudOcupacion(e.target.value)} placeholder="Ej: Estudiante, Ingeniero" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">¿Tiene otras mascotas?</label>
                  <select value={solicitudTieneMascotas} onChange={(e) => setSolicitudTieneMascotas(e.target.value)} className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm cursor-pointer">
                    <option value="No">No, sería la primera</option>
                    <option value="Sí">Sí, tengo mascotas</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Tipo de vivienda / Espacio</label>
                  <select value={solicitudEspacio} onChange={(e) => setSolicitudEspacio(e.target.value)} className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm cursor-pointer">
                    <option value="Casa">Casa con patio</option>
                    <option value="Departamento Grande">Departamento amplio</option>
                    <option value="Departamento Pequeño">Departamento pequeño</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">¿Por qué deseas adoptar a esta mascota?</label>
                <textarea required rows="3" value={solicitudMotivo} onChange={(e) => setSolicitudMotivo(e.target.value)} placeholder="Cuéntanos brevemente sobre tu estilo de vida..." className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm resize-none"></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setMascotaParaAdoptar(null)} className="flex-1 py-2.5 border border-[#ddc0bb] text-[#56423e] font-bold rounded-full text-xs hover:bg-[#f7f3ee]">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white font-bold rounded-full text-xs flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">send</span> Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PARA VER FOTO COMPLETA (LIGHTBOX) ================= */}
      {fotoAmpliada && (
        <div 
          className="fixed inset-0 bg-[#1c1c19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFotoAmpliada(null)}
        >
          {/* Botón cerrar */}
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#ffdad3] transition-all bg-white/10 hover:bg-white/20 p-2 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setFotoAmpliada(null)}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          
          <div 
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fotoAmpliada.url} 
              alt={fotoAmpliada.nombre} 
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center text-white font-bold text-lg" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              {fotoAmpliada.nombre}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE REGISTRO / EDICIÓN DE USUARIO (ADMINISTRADOR) ================= */}
      {modalUsuarioOpen && (
        <div className="fixed inset-0 z-50 bg-[#1c1c19]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#ddc0bb]/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="p-6 bg-[#fdf9f4] border-b border-[#ddc0bb]/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg text-[#9d3d2c] font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {usuarioEditando ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                </h3>
                <p className="text-xs text-[#89726d]">
                  {usuarioEditando ? 'Modifica los datos del perfil del usuario.' : 'Crea una nueva cuenta de usuario confirmada directamente.'}
                </p>
              </div>
              <button 
                onClick={() => setModalUsuarioOpen(false)} 
                className="p-1 text-[#89726d] hover:text-[#9d3d2c] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCrearOEditarUsuario} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Campo: Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  value={userNombreCompleto} 
                  onChange={(e) => setUserNombreCompleto(e.target.value)} 
                  placeholder="Ej: Juan Pérez" 
                  className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                />
              </div>

              {/* Fila: Email y Contraseña (solo si es nuevo usuario) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    disabled={!!usuarioEditando}
                    value={userEmail} 
                    onChange={(e) => setUserEmail(e.target.value)} 
                    placeholder="correo@ejemplo.com" 
                    className="w-full px-4 py-2 bg-[#f7f3ee] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                  />
                </div>
                {!usuarioEditando && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#56423e] ml-1">Contraseña</label>
                    <input 
                      type="password" 
                      required 
                      value={userPassword} 
                      onChange={(e) => setUserPassword(e.target.value)} 
                      placeholder="Mínimo 6 caracteres" 
                      className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                    />
                  </div>
                )}
              </div>

              {/* Fila: Teléfono y Dirección (solo editable en modo edición) */}
              {usuarioEditando && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#56423e] ml-1">Teléfono</label>
                    <input 
                      type="tel" 
                      value={userTelefono} 
                      onChange={(e) => setUserTelefono(e.target.value)} 
                      placeholder="Ej: 0998765432" 
                      className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#56423e] ml-1">Dirección</label>
                    <input 
                      type="text" 
                      value={userDireccion} 
                      onChange={(e) => setUserDireccion(e.target.value)} 
                      placeholder="Ej: Av. Principal y Calle Secundaria" 
                      className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                    />
                  </div>
                </div>
              )}

              {/* Fila: Rol y Organización (si es rescatista) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#56423e] ml-1">Rol de Usuario</label>
                  <select 
                    value={userRol} 
                    onChange={(e) => setUserRol(e.target.value)} 
                    className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] outline-none text-sm cursor-pointer"
                  >
                    <option value="adoptante">Adoptante</option>
                    <option value="rescatista">Rescatista</option>
                    <option value="admin_fundacion">Administrador de la Fundación</option>
                  </select>
                </div>

                {userRol === 'rescatista' && usuarioEditando && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#56423e] ml-1">Nombre de la Organización</label>
                    <input 
                      type="text" 
                      value={userOrganizacion} 
                      onChange={(e) => setUserOrganizacion(e.target.value)} 
                      placeholder="Ej: Refugio Huellitas" 
                      className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" 
                    />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalUsuarioOpen(false)} 
                  className="flex-1 py-2.5 border border-[#ddc0bb] text-[#56423e] font-bold rounded-full text-xs hover:bg-[#f7f3ee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-sm">save</span> 
                  {usuarioEditando ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {errorModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1c1c19]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#ddc0bb]/40 shadow-2xl p-6 text-center" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <div className="mb-4 text-[#9d3c2c] text-sm uppercase font-bold tracking-[0.2em]">Rechazo de imagen</div>
            <div className="mb-6 text-[#1c1c19] text-base leading-relaxed">
              {errorModalText}
            </div>
            <button
              onClick={() => setErrorModalOpen(false)}
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white font-bold text-sm hover:shadow-lg transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
        destinatario={destinatarioActual} 
      />
    </div>
  );
}