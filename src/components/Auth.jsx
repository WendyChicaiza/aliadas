import { useState } from 'react';
import { supabase } from '../supabase';
import { registrarLocal, ingresarLocal } from '../local';

function Auth({ modo, onCambiar, onVolver, onEntrar }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [mensaje, setMensaje] = useState('');
  const registro = modo === 'registro';

  async function enviar() {
    setMensaje('');
    if (supabase) {
      const { data, error } = registro
        ? await supabase.auth.signUp({ email, password: clave })
        : await supabase.auth.signInWithPassword({ email, password: clave });
      if (error) setMensaje(error.message);
      else if (registro && !data.session) setMensaje('Listo. Revisa tu correo para confirmar tu cuenta y luego ingresa.');
    } else {
      const r = registro ? await registrarLocal(email, clave) : await ingresarLocal(email, clave);
      if (r.error) setMensaje(r.error);
      else onEntrar(r.user);
    }
  }

  return (
    <div className="auth">
      <article className="card">
        <h2>{registro ? 'Crea tu cuenta' : 'Ingresa a ALIADAS'}</h2>
        <input placeholder="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Contraseña (mín. 6 caracteres)" type="password" value={clave} onChange={(e) => setClave(e.target.value)} />
        <button className="cta" onClick={enviar}>{registro ? 'Registrarme' : 'Ingresar'}</button>
        {mensaje && <p className="aviso">{mensaje}</p>}
        {!supabase && <small>Modo de prueba: tus datos se guardan solo en este navegador.</small>}
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
