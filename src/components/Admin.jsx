import { useState, useEffect } from 'react';
import { pedir } from '../api';

// Campos de cada sección que la administradora puede gestionar.
const SECCIONES = {
  cursos: { titulo: 'Cursos', ruta: '/api/cursos', campos: [['titulo', 'Título'], ['nivel', 'Nivel (Básico, Intermedio…)'], ['descripcion', 'Descripción'], ['enlace', 'Enlace (opcional)']] },
  mentoras: { titulo: 'Mentoras', ruta: '/api/mentoras', campos: [['nombre', 'Nombre'], ['especialidad', 'Especialidad'], ['descripcion', 'Descripción']] }
};

// Lista + formulario para crear, editar y borrar (CRUD) cursos o mentoras.
function Gestor({ seccion, token }) {
  const { titulo, ruta, campos } = SECCIONES[seccion];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editando, setEditando] = useState(null);
  const [estado, setEstado] = useState({ cargando: true, error: '' });

  async function cargar() {
    try {
      setItems(await pedir(ruta));
      setEstado({ cargando: false, error: '' });
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }
  useEffect(() => { setForm({}); setEditando(null); cargar(); }, [seccion]);

  async function guardar() {
    setEstado({ cargando: true, error: '' });
    try {
      if (editando) await pedir(`${ruta}/${editando}`, { metodo: 'PUT', cuerpo: form, token });
      else await pedir(ruta, { metodo: 'POST', cuerpo: form, token });
      setForm({}); setEditando(null);
      await cargar();
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }
  async function borrar(id) {
    if (!window.confirm('¿Seguro que quieres borrarlo?')) return;
    try {
      await pedir(`${ruta}/${id}`, { metodo: 'DELETE', token });
      await cargar();
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }
  function editar(item) {
    setEditando(item.id);
    setForm(Object.fromEntries(campos.map(([k]) => [k, item[k] || ''])));
  }

  return (
    <div>
      <article className="card formv">
        <h3>{editando ? `Editar ${titulo.toLowerCase()}` : `Agregar a ${titulo.toLowerCase()}`}</h3>
        {campos.map(([k, etiqueta]) => (
          <input key={k} placeholder={etiqueta} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        ))}
        <span>
          <button className="cta" onClick={guardar} disabled={estado.cargando}>{editando ? 'Guardar cambios' : 'Agregar'}</button>{' '}
          {editando && <button className="sec" onClick={() => { setEditando(null); setForm({}); }}>Cancelar</button>}
        </span>
      </article>
      {estado.error && <p className="aviso">{estado.error}</p>}
      {estado.cargando && <p>Cargando…</p>}
      {items.map((it) => (
        <article key={it.id} className="mov aparece">
          <span><h3>{it.titulo || it.nombre}</h3><small>{it.nivel || it.especialidad}</small></span>
          <span><button className="sec" onClick={() => editar(it)}>Editar</button> <button className="sec" onClick={() => borrar(it.id)}>Borrar</button></span>
        </article>
      ))}
    </div>
  );
}

// Mensajes que llegaron por el formulario de contacto.
function Mensajes({ token }) {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState({ cargando: true, error: '' });

  async function cargar() {
    try {
      setItems(await pedir('/api/admin/contactos', { token }));
      setEstado({ cargando: false, error: '' });
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }
  useEffect(() => { cargar(); }, []);

  async function borrar(id) {
    try {
      await pedir(`/api/admin/contactos/${id}`, { metodo: 'DELETE', token });
      await cargar();
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }

  return (
    <div>
      {estado.cargando && <p>Cargando mensajes…</p>}
      {estado.error && <p className="aviso">{estado.error}</p>}
      {!estado.cargando && !estado.error && items.length === 0 && <p>Aún no hay mensajes.</p>}
      {items.map((m) => (
        <article key={m.id} className="card aparece sep">
          <small>{new Date(m.createdAt).toLocaleString()}</small>
          <h3>{m.nombre} · {m.correo}</h3>
          <p>{m.mensaje}</p>
          <button className="sec" onClick={() => borrar(m.id)}>Borrar</button>
        </article>
      ))}
    </div>
  );
}

// Cuentas registradas (solo correo y fecha; la contraseña nunca sale del backend).
function Usuarias({ token }) {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState({ cargando: true, error: '' });

  async function cargar() {
    try {
      setItems(await pedir('/api/admin/usuarias', { token }));
      setEstado({ cargando: false, error: '' });
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }
  useEffect(() => { cargar(); }, []);

  async function borrar(u) {
    if (!window.confirm(`¿Borrar la cuenta ${u.correo} y todos sus movimientos?`)) return;
    try {
      await pedir(`/api/admin/usuarias/${u.id}`, { metodo: 'DELETE', token });
      await cargar();
    } catch (e) {
      setEstado({ cargando: false, error: e.message });
    }
  }

  return (
    <div>
      {estado.cargando && <p>Cargando usuarias…</p>}
      {estado.error && <p className="aviso">{estado.error}</p>}
      {!estado.cargando && !estado.error && <p><strong>{items.length}</strong> usuarias registradas</p>}
      {items.map((u) => (
        <article key={u.id} className="mov aparece">
          <span><h3>{u.correo}</h3><small>Se registró el {new Date(u.createdAt).toLocaleDateString()} · {u.movimientos} movimientos</small>
            <small><br />Cursos: {u.cursos?.length ? u.cursos.join(', ') : 'ninguno todavía'}</small></span>
          <button className="sec" onClick={() => borrar(u)}>Borrar</button>
        </article>
      ))}
    </div>
  );
}

function Admin({ onVolver }) {
  const [token, setToken] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [tab, setTab] = useState('mensajes');

  async function ingresar() {
    setError(''); setCargando(true);
    try {
      const d = await pedir('/api/admin/login', { metodo: 'POST', cuerpo: { correo, clave } });
      setToken(d.token);
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  }

  // Sin token: pantalla de login
  if (!token) {
    return (
      <div className="auth">
        <article className="card">
          <h2>Panel de administradora</h2>
          <input placeholder="Correo de administradora" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <input placeholder="Contraseña" type="password" value={clave} onChange={(e) => setClave(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ingresar()} />
          <button className="cta" onClick={ingresar} disabled={cargando}>{cargando ? 'Entrando…' : 'Ingresar'}</button>
          {error && <p className="aviso">{error}</p>}
          <p><button className="link" onClick={onVolver}>Volver</button></p>
        </article>
      </div>
    );
  }

  // Con token: panel privado
  return (
    <main className="admin">
      <div className="fila titulo">
        <h1>Panel de administradora</h1>
        <button className="sec" onClick={() => { setToken(''); onVolver(); }}>Salir</button>
      </div>
      <div className="tabs">
        {[['mensajes', 'Mensajes'], ['usuarias', 'Usuarias'], ['cursos', 'Cursos'], ['mentoras', 'Mentoras']].map(([k, t]) => (
          <button key={k} className={tab === k ? 'tab activo' : 'tab'} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>
      {tab === 'mensajes' && <Mensajes token={token} />}
      {tab === 'usuarias' && <Usuarias token={token} />}
      {(tab === 'cursos' || tab === 'mentoras') && <Gestor seccion={tab} token={token} />}
    </main>
  );
}
export default Admin;
