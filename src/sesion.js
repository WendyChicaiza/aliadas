// Guarda la sesión de la usuaria (token del backend) en este navegador.
const K = 'aliadas_sesion_api';
export function leerSesion() {
  try { return JSON.parse(localStorage.getItem(K)); } catch { return null; }
}
export function guardarSesion(s) {
  try { localStorage.setItem(K, JSON.stringify(s)); } catch { /* sin almacenamiento: la sesión dura mientras la página esté abierta */ }
}
export function borrarSesion() {
  try { localStorage.removeItem(K); } catch { /* nada que borrar */ }
}
