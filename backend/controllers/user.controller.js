const eliminarPerfilAdoptante = async (req, res) => {
  try {
    const userId = req.user.id; // Obtener el ID del usuario desde el token de autenticación
    // Lógica para eliminar el perfil de adoptante
    const { data, error } = await supabase
      .from('perfiles')
      .delete()
      .eq('user_id', userId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  catch (error) {
    console.error('Error al eliminar perfil de adoptante:', error);
    return res.status(500).json({ error: 'Error interno del servidor al eliminar perfil de adoptante.' });
  }
}


module.exports = { eliminarPerfilAdoptante };