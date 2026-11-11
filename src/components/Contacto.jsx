import { useState } from 'react';
import { API } from '../api';

function Contacto() {
  const [f, setF] = useState({ nombre: '', correo: '', mensaje: '' });
  const [estado, setEstado] = useState(''); // '', enviando, ok, error
  const [aviso, setAviso] = useState('');
  const cambiar = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar() {
    setEstado('enviando');
    setAviso('');
    try {
      const r = await fetch(API + '/api/contacto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'No se pudo enviar.');
      setEstado('ok');
      setF({ nombre: '', correo: '', mensaje: '' });
    } catch (e) {
      setEstado('error');
      setAviso(e instanceof TypeError ? 'No pude conectar con el servidor. Intenta más tarde.' : e.message);
    }
  }

  return (
    <section id="contacto" className="bloque">
      <h2>Contáctanos</h2>
      <article className="card formv" style={{ maxWidth: 480, margin: '0 auto' }}>
        <input placeholder="Nombre" value={f.nombre} onChange={cambiar('nombre')} />
        <input placeholder="Correo" type="email" value={f.correo} onChange={cambiar('correo')} />
        <textarea placeholder="Tu mensaje" rows="4" value={f.mensaje} onChange={cambiar('mensaje')} />
        <button className="cta" onClick={enviar} disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}</button>
        {estado === 'ok' && <p className="aviso">✓ ¡Gracias! Recibimos tu mensaje.</p>}
        {estado === 'error' && <p className="aviso">{aviso}</p>}
      </article>
    </section>
  );
}
export default Contacto;
