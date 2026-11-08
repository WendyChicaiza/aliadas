const K = 'aliadas_cuentas';
const S = 'aliadas_sesion';
const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
async function hash(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export const sesionLocal = () => leer(S, null);
export const salirLocal = () => localStorage.removeItem(S);
export const leerMov = (id) => leer('aliadas_mov_' + id, []);
export const guardarMov = (id, m) => guardar('aliadas_mov_' + id, m);
export async function registrarLocal(email, clave) {
  const e = email.trim().toLowerCase();
  if (!e.includes('@')) return { error: 'Escribe un correo válido.' };
  if (clave.length < 6) return { error: 'La contraseña debe tener mínimo 6 caracteres.' };
  const c = leer(K, {});
  if (c[e]) return { error: 'Ese correo ya tiene cuenta. Toca "Ya tengo cuenta".' };
  c[e] = await hash(clave);
  guardar(K, c);
  const user = { id: e, email: e };
  guardar(S, user);
  return { user };
}
export async function ingresarLocal(email, clave) {
  const e = email.trim().toLowerCase();
  const c = leer(K, {});
  if (!c[e] || c[e] !== (await hash(clave))) return { error: 'Correo o contraseña incorrectos.' };
  const user = { id: e, email: e };
  guardar(S, user);
  return { user };
}
