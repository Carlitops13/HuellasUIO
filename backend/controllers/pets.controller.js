const supabase = require('../supabase');
const axios = require("axios");
const FormData = require("form-data");
/**
 * Listar las mascotas registradas por el rescatista.
 */
const viewOurPets = async (req, res) => {
  try {
    const { data: mascotas, error } = await req.supabase
      .from('mascotas')
      .select('*')
      .eq('registrado_por', req.user.id)
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(mascotas);
  } catch (err) {
    console.error('Error en viewOurPets:', err);
    return res.status(500).json({ error: 'Error interno al obtener mascotas del rescatista.' });
  }
};

/**
 * Agregar una nueva mascota.
 * Valida los datos y asigna registrado_por al ID del rescatista.
 */
const addPet = async (req, res) => {
  const { nombre, especie, fecha_nacimiento_estimada, tamano, sexo, estado_esterilizacion, descripcion, foto_url, sector_quito, especiePrediccion } = req.body || {};

  if (!nombre || !fecha_nacimiento_estimada || !sector_quito) {
    return res.status(400).json({
      error: 'Por favor, proporciona el nombre, fecha de nacimiento estimada y el sector de Quito.'
    });
  }

  // Mapear valores a los enums en minúsculas para cumplir con las restricciones del tipo ENUM en Postgres
  const especieFinal = especie ? especie.toLowerCase() : 'perro';
  const tamanoFinal = tamano ? tamano.toLowerCase() : 'mediano';
  const sexoFinal = sexo ? sexo.toLowerCase() : 'macho';

  // Validaciones básicas de tipo ENUM en JS antes de insertar
  const especiesValidas = ['perro', 'gato', 'otro'];
  const tamanosValidos = ['pequeño', 'mediano', 'grande'];
  const sexosValidos = ['macho', 'hembra'];

  if (!especiesValidas.includes(especieFinal)) {
    return res.status(400).json({ error: `Especie inválida. Valores válidos: ${especiesValidas.join(', ')}` });
  }
  if (tamano && !tamanosValidos.includes(tamanoFinal)) {
    return res.status(400).json({ error: `Tamaño inválido. Valores válidos: ${tamanosValidos.join(', ')}` });
  }
  if (sexo && !sexosValidos.includes(sexoFinal)) {
    return res.status(400).json({ error: `Sexo inválido. Valores válidos: ${sexosValidos.join(', ')}` });
  }
  if (especiePrediccion && especiePrediccion.toLowerCase() !== especieFinal) {
    return res.status(400).json({ error: `La especie predicha no coincide con la especie proporcionada. Verifica que sea un ${especieFinal}.` });
  }

  try {
    const { data: nuevaMascota, error } = await req.supabase
      .from('mascotas')
      .insert({
        nombre,
        especie: especieFinal,
        fecha_nacimiento_estimada,
        tamano: tamanoFinal,
        sexo: sexoFinal,
        estado_esterilizacion: estado_esterilizacion || false,
        estado_adopcion: 'disponible', 
        descripcion,
        foto_url,
        sector_quito,
        registrado_por: req.user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(nuevaMascota);
  } catch (err) {
    console.error('Error en addPet:', err);
    return res.status(500).json({ error: 'Error interno del servidor al registrar la mascota.' });
  }
};

/**
 * Eliminar una mascota por ID.
 */
const deletePet = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await req.supabase
      .from('mascotas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Mascota eliminada exitosamente.' });
  } catch (err) {
    console.error('Error en deletePet:', err);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar la mascota.' });
  }
};

/**
 * Actualizar datos de una mascota.
 */
const updatePet = async (req, res) => {
  const { id } = req.params;
  const { nombre, especie, fecha_nacimiento_estimada, tamano, sexo, estado_esterilizacion, estado_adopcion, descripcion, foto_url, sector_quito, especiePrediccion } = req.body || {};

  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (especie !== undefined) updates.especie = especie.toLowerCase();
  if (fecha_nacimiento_estimada !== undefined) updates.fecha_nacimiento_estimada = fecha_nacimiento_estimada;
  if (tamano !== undefined) updates.tamano = tamano.toLowerCase();
  if (sexo !== undefined) updates.sexo = sexo.toLowerCase();
  if (estado_esterilizacion !== undefined) updates.estado_esterilizacion = estado_esterilizacion;
  if (estado_adopcion !== undefined) updates.estado_adopcion = estado_adopcion.toLowerCase();
  if (descripcion !== undefined) updates.descripcion = descripcion;
  if (foto_url !== undefined) updates.foto_url = foto_url;
  if (sector_quito !== undefined) updates.sector_quito = sector_quito;

  // Validaciones de enums antes de actualizar
  if (updates.especie && !['perro', 'gato', 'otro'].includes(updates.especie)) {
    return res.status(400).json({ error: 'Especie inválida.' });
  }
  if (updates.tamano && !['pequeño', 'mediano', 'grande'].includes(updates.tamano)) {
    return res.status(400).json({ error: 'Tamaño inválido.' });
  }
  if (updates.sexo && !['macho', 'hembra'].includes(updates.sexo)) {
    return res.status(400).json({ error: 'Sexo inválido.' });
  }
  if (updates.estado_adopcion && !['disponible', 'en_proceso', 'adoptado', 'comunitario_monitoreado'].includes(updates.estado_adopcion)) {
    return res.status(400).json({ error: 'Estado de adopción inválido.' });
  }
  if (especiePrediccion && especiePrediccion.toLowerCase() !== especie) {
    return res.status(400).json({ error: `La especie predicha no coincide con la especie proporcionada. Verifica que sea un ${especie}.` });
  }

  try {
    const { data: mascotaActualizada, error } = await req.supabase
      .from('mascotas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(mascotaActualizada);
  } catch (err) {
    console.error('Error en updatePet:', err);
    return res.status(500).json({ error: 'Error interno del servidor al actualizar la mascota.' });
  }
};

/**
 * Obtener detalles de una mascota del rescatista.
 */
const viewOurPet = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: mascota, error } = await req.supabase
      .from('mascotas')
      .select('*')
      .eq('id', id)
      .eq('registrado_por', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(mascota);
  } catch (err) {
    console.error('Error en viewOurPet:', err);
    return res.status(500).json({ error: 'Error interno del servidor al obtener la mascota.' });
  }
};

/**
 * Listar todas las mascotas (publico)
 */
const viewAllPets = async (req, res) => {
  try {
    const { data: mascotas, error } = await supabase
      .from('mascotas')
      .select('*')
      .neq('estado_adopcion', 'adoptado')
      .order('creado_el', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(mascotas);
  } catch (err) {
    console.error('Error en viewAllPets:', err);
    return res.status(500).json({ error: 'Error interno del servidor al listar el catálogo.' });
  }
};

/**
 * Obtener detalles de una mascota (publico).
 */
const viewAllPet = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: mascota, error } = await supabase
      .from('mascotas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Mascota no encontrada.' });
    }

    return res.status(200).json(mascota);
  } catch (err) {
    console.error('Error en viewAllPet:', err);
    return res.status(500).json({ error: 'Error interno del servidor al obtener mascota.' });
  }
};

/**
 * Subir una foto de mascota al bucket "mascotas" y retornar su URL pública.
 */
const uploadPetImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Por favor, proporciona un archivo de imagen.' });
  }

  try {
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const urlIA = process.env.IA_API_URL;
    const form = new FormData();

    form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });

    const respuestaIA = await axios.post(
        urlIA,
        form,
        {
            headers: form.getHeaders()
        }
    );

    const resultado = respuestaIA.data;

    console.log(resultado);
    if (
      !["gato", "perro"].includes(resultado.animal)
    ) {
        return res.status(400).json({
            error: "La imagen no corresponde a un perro o un gato."
        });
    }

    if (resultado.confianza>=80) {
      const publicUrl = await supabase.uploadBufferToStorage(
      'Mascotas',
      uniqueFileName,
      req.file.buffer,
      req.file.mimetype
    );
      return res.status(200).json({ tipo: resultado.animal, confianza: resultado.confianza , estado: "APROBADO", url: publicUrl });
    }else{
        return res.status(400).json({ tipo: resultado.animal, confianza: resultado.confianza , estado: "RECHAZADO"});
    }

    
  } catch (err) {
    if (err.response) {
        console.error(err.response.data);
    } else {
        console.error(err.message);
    }

    return res.status(500).json({
        error: "No fue posible analizar la imagen con la IA."
    });
}
};

module.exports = {
  viewOurPets,
  addPet,
  deletePet,
  updatePet,
  viewOurPet,
  viewAllPets,
  viewAllPet,
  uploadPetImage
};
