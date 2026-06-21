import React, { useState, useEffect } from 'react';

export default function DashboardForm({ token, onLogout, onIrAPerfil }) {
  // --- ESTADOS DE CONTROL GENERAL ---
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [rolUsuario, setRolUsuario] = useState('adoptante'); 
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  // --- ESTADOS DE MASCOTAS ---
  const [mascotas, setMascotas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');

  // --- ESTADOS DEL FORMULARIO "SUBIR MASCOTA" ---
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('Perro');
  const [nuevaEdad, setNuevaEdad] = useState('');
  const [nuevoGenero, setNuevoGenero] = useState('Macho');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [nuevoRasgo, setNuevoRasgo] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');

  // --- ESTADOS DEL FORMULARIO DE SOLICITUD DE ADOPCIÓN (ADOPTANTE) ---
  const [mascotaParaAdoptar, setMascotaParaAdoptar] = useState(null); 
  const [solicitudTelefono, setSolicitudTelefono] = useState('');
  const [solicitudOcupacion, setSolicitudOcupacion] = useState('');
  const [solicitudTieneMascotas, setSolicitudTieneMascotas] = useState('No');
  const [solicitudEspacio, setSolicitudEspacio] = useState('Casa');
  const [solicitudMotivo, setSolicitudMotivo] = useState('');
  
  const [misSolicitudes, setMisSolicitudes] = useState([
    { id: 101, mascotaNombre: 'Luna', tipo: 'Gato', imagen: 'https://i.pinimg.com/1200x/ea/7d/d4/ea7dd494ac2f53265b365a1342ff86e9.jpg', estado: 'En Revisión', fecha: '2026-06-20' }
  ]);

  // --- ESTADO GLOBAL DE SOLICITUDES RECIBIDAS (RESCATISTA) ---
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([
    {
      id: 201,
      mascotaNombre: 'Bruno',
      adoptanteNombre: 'Carlos Ortiz',
      telefono: '0995544332',
      ocupacion: 'Ingeniero en Sistemas',
      espacio: 'Casa con patio',
      tieneMascotas: 'No',
      motivo: 'Busco un compañero activo para hacer senderismo y salir a correr por las mañanas en Quito Norte.',
      estado: 'Pendiente',
      fecha: '2026-06-21',
      imagen: 'https://i.pinimg.com/1200x/1e/4a/0f/1e4a0f740e7884e41ccb0828fffd5c8f.jpg'
    },
    {
      id: 202,
      mascotaNombre: 'Oliver',
      adoptanteNombre: 'Joahn Silva',
      telefono: '0988776655',
      ocupacion: 'Estudiante Universitario',
      espacio: 'Departamento pequeño',
      tieneMascotas: 'Sí, un gato de 1 año',
      motivo: 'Quiero una segunda mascota para que le haga compañía a mi gatito actual mientras estudio en casa.',
      estado: 'Pendiente',
      fecha: '2026-06-21',
      imagen: 'https://i.pinimg.com/736x/64/77/ac/6477acd0bd1958580280b29bdab73994.jpg'
    }
  ]);

  // 1. LEER EL ROL DESDE LA PROP TOKEN
  useEffect(() => {
    if (!token) return;
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

        const rolDetectado = userObj?.user_metadata?.rol || userObj?.user_metadata?.role || userObj?.rol || userObj?.role || datosUsuario?.rol;
        
        if (rolDetectado) {
          const rolLimpio = rolDetectado.toString().trim().toLowerCase();
          if (rolLimpio.includes('rescat')) {
            setRolUsuario('rescatista');
            setSeccionActiva('inicio'); 
          } else if (rolLimpio.includes('admin')) {
            setRolUsuario('administrador');
            setSeccionActiva('inicio');
          } else {
            setRolUsuario(rolLimpio);
            setSeccionActiva('explorar'); 
          }
        }
      }
    } catch (error) {
      console.error("Error al procesar el token en el Dashboard:", error);
    }
  }, [token]);

  // 2. DATOS INICIALES
  useEffect(() => {
    const datosEjemplo = [
      { id: 1, nombre: 'Bruno', tipo: 'Perro', edad: '2 años', genero: 'Macho', imagen: 'https://i.pinimg.com/1200x/1e/4a/0f/1e4a0f740e7884e41ccb0828fffd5c8f.jpg', ubicacion: 'Quito Norte', rasgo: 'Muy activo', rescatista: 'Marta Arias' },
      { id: 2, nombre: 'Simba', tipo: 'Gato', edad: '2 años', genero: 'Macho', imagen: 'https://i.pinimg.com/1200x/ea/7d/d4/ea7dd494ac2f53265b365a1342ff86e9.jpg', ubicacion: 'Cumbayá', rasgo: 'Juguetón', rescatista: 'Marta Arias' },
      { id: 3, nombre: 'Bella', tipo: 'Perro', edad: '1 año', genero: 'Hembra', imagen: 'https://i.pinimg.com/736x/cb/a7/8a/cba78a6ce7264cf25f026acf6c4c7bbf.jpg', ubicacion: 'Valle de los Chillos', rasgo: 'Tranquila', rescatista: 'Juan Pérez' },
      { id: 4, nombre: 'Oliver', tipo: 'Gato', edad: '4 meses', genero: 'Macho', imagen: 'https://i.pinimg.com/736x/64/77/ac/6477acd0bd1958580280b29bdab73994.jpg', ubicacion: 'Tumbaco', rasgo: 'Independiente', rescatista: 'Marta Arias' },
    ];
    setMascotas(datosEjemplo);
  }, []);

  // FILTRADO GLOBAL
  const mascotasFiltradas = mascotas.filter(m => {
    const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSel === 'Todos' || m.tipo === categoriaSel;
    return coincideBusqueda && coincideCategoria;
  });

  const misRescatados = mascotasFiltradas.filter(m => m.rescatista === nombreUsuario || m.rescatista === 'Marta Arias');

  // MANEJAR SUBIDA DE NUEVA MASCOTA
  const handleSubirMascota = (e) => {
    e.preventDefault();
    const nuevaMascotaObj = {
      id: Date.now(),
      nombre: nuevoNombre,
      tipo: nuevoTipo,
      edad: nuevaEdad,
      genero: nuevoGenero,
      ubicacion: nuevaUbicacion || 'Quito Centro',
      rasgo: nuevoRasgo || 'Cariñoso',
      imagen: nuevaImagen || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500', 
      rescatista: nombreUsuario
    };
    setMascotas([nuevaMascotaObj, ...mascotas]);
    setNuevoNombre(''); setNuevaEdad(''); setNuevaUbicacion(''); setNuevoRasgo(''); setNuevaImagen('');
    setSeccionActiva('inicio');
  };

  // MANEJAR GESTIÓN DE ESTADOS DESDE EL PERFIL DE RESCATISTA
  const handleCambiarEstadoSolicitud = (idSolicitud, nuevoEstado) => {
    setSolicitudesRecibidas(solicitudesRecibidas.map(sol => 
      sol.id === idSolicitud ? { ...sol, estado: nuevoEstado } : sol
    ));
  };

  // MANEJAR ENVÍO DE SOLICITUD DE ADOPCIÓN (ADOPTANTE)
  const handleEnviarSolicitud = (e) => {
    e.preventDefault();
    const nuevaSolicitud = {
      id: Date.now(),
      mascotaNombre: mascotaParaAdoptar.nombre,
      tipo: mascotaParaAdoptar.tipo,
      imagen: mascotaParaAdoptar.imagen,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    setMisSolicitudes([nuevaSolicitud, ...misSolicitudes]);
    setSolicitudTelefono(''); setSolicitudOcupacion(''); setSolicitudMotivo('');
    setMascotaParaAdoptar(null);
    setSeccionActiva('mis-solicitudes');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mascotasFiltradas.map((m) => (
          <div key={m.id} className="bg-white rounded-3xl overflow-hidden border border-[#ddc0bb]/30 shadow-md flex flex-col justify-between">
            <div className="relative aspect-square overflow-hidden bg-[#f7f3ee]">
              <img src={m.imagen} alt={m.nombre} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1c1c19] text-base" style={{ fontFamily: "'Quicksand', sans-serif" }}>{m.nombre}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${m.genero === 'Macho' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>{m.genero}</span>
              </div>
              <p className="text-xs text-[#89726d] mb-1 font-semibold">{m.ubicacion} • {m.rasgo}</p>
              <p className="text-xs text-[#56423e] font-medium mb-4">Edad: {m.edad}</p>
              <button 
                onClick={() => setMascotaParaAdoptar(m)}
                className="w-full bg-[#9d3d2c] text-white font-bold py-2 rounded-full text-xs hover:bg-[#802919] transition-all"
              >
                Conocer más
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf9f4] text-[#1c1c19] flex overflow-x-hidden selection:bg-[#ffdad3]">
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      {/* ================= BARRA LATERAL (SIDEBAR) ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#ddc0bb]/30 transform ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col justify-between shadow-sm`}>
        <div>
          <div className="p-6 flex items-center justify-between border-b border-[#f7f3ee]">
            <div className="text-2xl text-[#9d3d2c] tracking-tight font-bold" style={{ fontFamily: "'Quicksand', sans-serif" }}>Huellas UIO</div>
            <button className="md:hidden text-[#89726d]" onClick={() => setSidebarAbierto(false)}><span className="material-symbols-outlined">close</span></button>
          </div>

          <nav className="p-4 space-y-1.5" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {rolUsuario === 'adoptante' && (
              <>
                <button onClick={() => setSeccionActiva('explorar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'explorar' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">pets</span> Adoptar Mascota</button>
                <button onClick={() => setSeccionActiva('mis-solicitudes')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'mis-solicitudes' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">description</span> Mis Solicitudes</button>
              </>
            )}

            {rolUsuario === 'rescatista' && (
              <>
                <button onClick={() => setSeccionActiva('inicio')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'inicio' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">home_pin</span> Mis Rescatados</button>
                <button onClick={() => setSeccionActiva('explorar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'explorar' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">travel_explore</span> Explorar Adopciones</button>
                <button onClick={() => setSeccionActiva('subir-mascota')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'subir-mascota' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">add_circle</span> Subir Mascota</button>
                <button onClick={() => setSeccionActiva('solicitudes-recibidas')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all ${seccionActiva === 'solicitudes-recibidas' ? 'bg-[#ffdad3]/40 text-[#9d3d2c]' : 'text-[#56423e] hover:bg-[#f7f3ee]'}`}><span className="material-symbols-outlined text-lg">mail</span> Solicitudes Recibidas</button>
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

        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl text-[#9d3d2c] font-bold tracking-tight mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>¡Hola, {nombreUsuario}! </h1>
          <p className="text-[#89726d] text-xs font-bold uppercase tracking-widest bg-[#ffdad3]/40 text-[#9d3d2c] inline-block px-3 py-1 rounded-md" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>Rol actual: {rolUsuario}</p>
        </div>

        {seccionActiva === 'explorar' && renderCatalogoAdopciones()}

        {/* ================= VISTA INTERACTIVA: MIS RESCATADOS ================= */}
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
              <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm">
                <p className="text-[#89726d] font-semibold">No tienes animalitos registrados todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {misRescatados.map((m) => (
                  <div key={m.id} className="bg-white rounded-3xl overflow-hidden border border-[#ddc0bb]/30 shadow-md flex flex-col justify-between group">
                    <div className="relative aspect-square overflow-hidden bg-[#f7f3ee]">
                      <img src={m.imagen} alt={m.nombre} className="w-full h-full object-cover" />
                      <span className="absolute bottom-3 left-3 bg-[#9d3d2c] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Tuyo</span>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[#1c1c19] text-base" style={{ fontFamily: "'Quicksand', sans-serif" }}>{m.nombre}</h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Refugiado</span>
                      </div>
                      <p className="text-xs text-[#89726d] mb-1">{m.ubicacion} • {m.rasgo}</p>
                      <p className="text-xs text-[#56423e] font-medium mb-4">Edad: {m.edad}</p>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-[#ddc0bb] text-[#56423e] font-bold rounded-full text-xs hover:bg-[#f7f3ee]">Editar</button>
                        <button className="p-2 border border-rose-200 text-rose-600 rounded-full hover:bg-rose-50 flex items-center justify-center">
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

        {/* ================= VISTA INTERACTIVA: SUBIR MASCOTA ================= */}
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
                  <input type="text" value={nuevaEdad} onChange={(e) => setNuevaEdad(e.target.value)} required placeholder="Ej: 8 meses o 2 años" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56423e] ml-1">URL de la Imagen de la Mascota</label>
                <input type="url" value={nuevaImagen} onChange={(e) => setNuevaImagen(e.target.value)} placeholder="https://ejemplo.com/foto-perrito.jpg" className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm" />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-gradient-to-r from-[#9d3d2c] to-[#bd5541] text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-lg">check_circle</span> Publicar Mascota
              </button>
            </form>
          </div>
        )}

        {/* ================= VISTA INTERACTIVA: MIS SOLICITUDES ENVIADAS (Adoptante) ================= */}
        {seccionActiva === 'mis-solicitudes' && (
          <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <h2 className="text-2xl text-[#9d3d2c] font-bold mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>Tus Procesos de Adopción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misSolicitudes.map((sol) => (
                <div key={sol.id} className="bg-white p-5 rounded-3xl border border-[#ddc0bb]/30 shadow-md flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f7f3ee] flex-shrink-0">
                    <img src={sol.imagen} alt={sol.mascotaNombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-[#1c1c19]" style={{ fontFamily: "'Quicksand', sans-serif" }}>{sol.mascotaNombre}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        sol.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#ffdad3] text-[#9d3d2c]'
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
          </div>
        )}

        {/* ================= VISTA INTERACTIVA: SOLICITUDES RECIBIDAS (RESCATISTA) ================= */}
        {seccionActiva === 'solicitudes-recibidas' && (
          <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            <h2 className="text-2xl text-[#9d3d2c] font-bold mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>Formularios de Adopción Recibidos</h2>
            <p className="text-[#89726d] text-xs font-semibold mb-6">Evalúa el perfil de los adoptantes postulados para tus peluditos rescatados.</p>

            {solicitudesRecibidas.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-[#ddc0bb]/30 text-center shadow-sm">
                <p className="text-[#89726d] font-semibold">No has recibido formularios de adopción todavía.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {solicitudesRecibidas.map((sol) => (
                  <div key={sol.id} className="bg-white p-6 rounded-3xl border border-[#ddc0bb]/30 shadow-md flex flex-col md:flex-row gap-6 justify-between">
                    
                    {/* Izquierda: Info de la Mascota e Interesado */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start flex-1">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f7f3ee] flex-shrink-0 border border-[#ddc0bb]/20">
                        <img src={sol.imagen} alt={sol.mascotaNombre} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-[#1c1c19]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            Postulación por {sol.mascotaNombre}
                          </h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            sol.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            sol.estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {sol.estado}
                          </span>
                        </div>
                        <p className="text-sm text-[#9d3d2c] font-bold">Interesado: {sol.adoptanteNombre}</p>
                        <p className="text-xs text-[#56423e] font-medium"> Teléfono: {sol.telefono} | Ocupación: {sol.ocupacion}</p>
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
                    <option value="Sí, Perro(s)">Sí, tengo perro(s)</option>
                    <option value="Sí, Gato(s)">Sí, tengo gato(s)</option>
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
    </div>
  );
}