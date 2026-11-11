// Dirección del backend: en local es el puerto 3001; al publicar se define con VITE_API_URL.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Llama al backend y devuelve los datos; si algo falla lanza un Error con un mensaje claro.
export async function pedir(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  let r;
  try {
    r = await fetch(API + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new Error('No pude conectar con el servidor. Intenta más tarde.');
  }
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || 'Algo salió mal.');
  return datos;
}
