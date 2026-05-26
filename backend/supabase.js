const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//Mensaje de error si no se configuran las credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n==================================================================');
  console.error('ERROR CRÍTICO: SUPABASE_URL o SUPABASE_ANON_KEY no están configurados en .env');
  console.error('Por favor, configura las credenciales de tu proyecto de Supabase en el archivo:');
  console.error('  backend/.env');
  console.error('==================================================================\n');
  process.exit(1);
}

//Cliente público estándar
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper para crear un cliente con un token
const getClientWithToken = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false
    }
  });
};


supabase.admin = supabaseAdmin;
supabase.getClientWithToken = getClientWithToken;

module.exports = supabase;
