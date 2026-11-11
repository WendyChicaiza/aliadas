import { useState } from 'react';
import { pedir } from '../api';
import { guardarSesion } from '../sesion';

// Registro e ingreso de usuarias: las cuentas viven en MongoDB (contraseña cifrada en el backend).
function Auth({ modo, onCambiar, onVolver, onEntrar }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const registro = modo === 'registro';

  async function enviar() {
    setMensaje('');
    setCargando(true);
    try {
      const d = await pedir(registro ? '/api/usuarias/registro' : '/api/usuarias/ingreso', {
        metodo: 'POST',
        cuerpo: { correo: email, clave }
      });
      const sesion = { id: d.usuaria.id, email: d.usuaria.email, token: d.token };
      guardarSesion(sesion);
      onEntrar(sesion);
    } catch (e) {
      setMensaje(e.message);
    }
    setCargando(false);
  }

  return (
    <div className="auth">
      <article className="card">
        <h2>{registro ? 'Crea tu cuenta' : 'Ingresa a ALIADAS'}</h2>
        <input placeholder="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Contraseña (mín. 6 caracteres)" type="password" value={clave} onChange={(e) => setClave(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} />
        <button className="cta" onClick={enviar} disabled={cargando}>
          {cargando ? 'Un momento…' : registro ? 'Registrarme' : 'Ingresar'}
        </button>
        {cargando && <small>Si el servidor estaba dormido, puede tardar hasta un minuto.</small>}
        {mensaje && <p className="aviso">{mensaje}</p>}
        <p>
          <button className="link" onClick={() => onCambiar(registro ? 'ingresar' : 'registro')}>
            {registro ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
          </button>
          {' · '}
          <button className="link" onClick={onVolver}>Volver</button>
        </p>
      </article>
    </div>
  );
}
export default Auth;
