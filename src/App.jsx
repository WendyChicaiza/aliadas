import { useState, useEffect } from 'react';
import { pedir } from './api';
import { leerSesion, borrarSesion } from './sesion';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Finanzas from './components/Finanzas';
import Academia from './components/Academia';
import Comunidad from './components/Comunidad';
import Crecimiento from './components/Crecimiento';
import Metas from './components/Metas';
import Chatbot from './components/Chatbot';
import Admin from './components/Admin';
import { useCatalogo } from './useCatalogo';
import Icono from './icons';
import { useGuardado } from './useGuardado';

import { MODULOS } from './modulos';

function App() {
  const [usuario, setUsuario] = useState(leerSesion()); // {id, email, token}
  const [vista, setVista] = useState('inicio');
  const [modulo, setModulo] = useState('Inicio');
  const [movimientos, setMovimientos] = useState([]);
  const { cursos, mentoras } = useCatalogo(); // viene del backend (MongoDB)
  const [extrasCursos, setExtrasCursos] = useGuardado('aliadas_cursos', []);
  const [extrasMentoras, setExtrasMentoras] = useGuardado('aliadas_mentoras', []);
  const [metas, setMetas] = useGuardado('aliadas_metas', []);
  const [aviso, setAviso] = useState('');
  const [inscritos, setInscritos] = useState([]); // ids de cursos a los que está inscrita
  const [avisoCursos, setAvisoCursos] = useState('');
  const [ambito, setAmbito] = useGuardado('aliadas_ambito', 'emprendimiento');

  // Cursos a los que está inscrita
  useEffect(() => {
    if (!usuario) { setInscritos([]); return; }
    pedir('/api/inscripciones', { token: usuario.token }).then(setInscritos).catch(() => {});
  }, [usuario?.id]);

  // Si ya está inscrita se cancela; si no, se inscribe.
  async function alternarInscripcion(cursoId) {
    const estaba = inscritos.includes(cursoId);
    try {
      await pedir(estaba ? `/api/inscripciones/${cursoId}` : '/api/inscripciones', {
        metodo: estaba ? 'DELETE' : 'POST', cuerpo: estaba ? undefined : { curso: cursoId }, token: usuario.token
      });
      setInscritos(estaba ? inscritos.filter((i) => i !== cursoId) : [...inscritos, cursoId]);
      setAvisoCursos('');
    } catch (e) {
      setAvisoCursos(e.message);
    }
  }

  // Movimientos de la usuaria, desde MongoDB
  useEffect(() => {
    async function cargarMov() {
      if (!usuario) { setMovimientos([]); return; }
      try {
        setMovimientos(await pedir('/api/movimientos', { token: usuario.token }));
        setAviso('');
      } catch (e) {
        setAviso(e.message);
        if (e.message.includes('sesión venció')) salir();
      }
    }
    cargarMov();
  }, [usuario?.id]);

  async function agregar(mov) {
    try {
      const nuevo = await pedir('/api/movimientos', { metodo: 'POST', cuerpo: { ...mov, ambito }, token: usuario.token });
      setMovimientos([...movimientos, nuevo]);
      setAviso('');
    } catch (e) {
      setAviso(e.message);
    }
  }

  function salir() {
    borrarSesion();
    setUsuario(null);
    setVista('inicio');
  }

  if (!usuario) {
    if (vista === 'admin') return <Admin onVolver={() => setVista('inicio')} />;
    if (vista === 'inicio') {
      return <Landing onIngresar={() => setVista('ingresar')} onRegistro={() => setVista('registro')} onAdmin={() => setVista('admin')} />;
    }
    return <Auth modo={vista} onCambiar={setVista} onVolver={() => setVista('inicio')} onEntrar={setUsuario} />;
  }

  const actual = MODULOS.find((m) => m.n === modulo);
  const nombre = usuario.email.split('@')[0];
  const movs = movimientos.filter((m) => (m.ambito || 'emprendimiento') === ambito);
  const conAmbito = ['Inicio', 'Mis finanzas', 'Mi crecimiento'].includes(modulo);
  return (
    <div className="shell">
      <aside className="lateral">
        <div className="marca"><img src="logo.png" alt="ALIADAS" className="logo-img" /><b>ALIADAS</b></div>
        <nav>
          {MODULOS.map((m) => (
            <button key={m.n} className={m.n === modulo ? 'activo' : ''} onClick={() => setModulo(m.n)}>
              <Icono nombre={m.i} /><b>{m.n}</b>
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <div className="fila titulo">
          <div><h1>{actual.n}</h1><p>{actual.d}</p></div>
          <span><small>{usuario.email}</small> <button className="sec" onClick={salir}>Salir</button></span>
        </div>
        {conAmbito && (
          <div className="tabs">
            <button className={ambito === 'emprendimiento' ? 'tab activo' : 'tab'} onClick={() => setAmbito('emprendimiento')}>🏪 Mi emprendimiento</button>
            <button className={ambito === 'personal' ? 'tab activo' : 'tab'} onClick={() => setAmbito('personal')}>👛 Finanzas personales</button>
          </div>
        )}
        {modulo === 'Inicio' && <Dashboard movimientos={movs} nombre={nombre} ambito={ambito} />}
        {modulo === 'Mis finanzas' && <Finanzas movimientos={movs} ambito={ambito} onAgregar={agregar} aviso={aviso} nombre={nombre} />}
        {modulo === 'Academia' && <Academia cursos={[...cursos, ...extrasCursos.map((c) => ({ ...c, local: true }))]} inscritos={inscritos} onInscribir={alternarInscripcion} aviso={avisoCursos} onAgregar={(c) => setExtrasCursos([...extrasCursos, { id: Date.now(), ...c }])} />}
        {modulo === 'Comunidad' && <Comunidad mentoras={[...mentoras, ...extrasMentoras]} onAgregar={(m) => setExtrasMentoras([...extrasMentoras, { id: Date.now(), ...m }])} />}
        {modulo === 'Mi crecimiento' && (
          <>
            <Crecimiento movimientos={movs} />
            <Metas metas={metas} onAgregar={(m) => setMetas([...metas, { id: Date.now(), ...m }])} />
          </>
        )}
      </main>
      <Chatbot />
    </div>
  );
}
export default App;
