import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { sesionLocal, salirLocal, leerMov, guardarMov } from './local';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Finanzas from './components/Finanzas';
import Academia from './components/Academia';
import Comunidad from './components/Comunidad';
import Crecimiento from './components/Crecimiento';
import Metas from './components/Metas';
import { useGuardado } from './useGuardado';

import { MODULOS } from './modulos';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('inicio');
  const [modulo, setModulo] = useState('Inicio');
  const [movimientos, setMovimientos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [mentoras, setMentoras] = useState([]);
  const [extrasCursos, setExtrasCursos] = useGuardado('aliadas_cursos', []);
  const [extrasMentoras, setExtrasMentoras] = useGuardado('aliadas_mentoras', []);
  const [metas, setMetas] = useGuardado('aliadas_metas', []);
  const [aviso, setAviso] = useState('');
  const [ambito, setAmbito] = useGuardado('aliadas_ambito', 'emprendimiento');

  useEffect(() => {
    if (!supabase) { setUsuario(sesionLocal()); return; }
    supabase.auth.getSession().then(({ data }) => setUsuario(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUsuario(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function cargar() {
      const pedir = async (f) => (await fetch(f)).json();
      setCursos(await pedir('cursos.json'));
      setMentoras(await pedir('mentoras.json'));
    }
    cargar();
  }, []);

  useEffect(() => {
    async function cargarMov() {
      if (!usuario) { setMovimientos([]); return; }
      if (!supabase) { setMovimientos(leerMov(usuario.id)); return; }
      const { data, error } = await supabase.from('movimientos').select('*').order('fecha');
      if (error) setAviso('No se pudieron cargar tus movimientos (' + error.message + '). Revisa que ejecutaste supabase-setup.sql en Supabase.');
      setMovimientos(data || []);
    }
    cargarMov();
  }, [usuario?.id]);

  async function agregar(mov) {
    if (!supabase) {
      const nuevo = [...movimientos, { id: Date.now(), ...mov, ambito }];
      setMovimientos(nuevo);
      guardarMov(usuario.id, nuevo);
      return;
    }
    const { data, error } = await supabase.from('movimientos').insert({ ...mov, ambito }).select().single();
    if (error) {
      setAviso('No se pudo guardar en la base de datos (' + error.message + '). Quedó solo en esta sesión. Revisa que ejecutaste supabase-setup.sql en Supabase.');
      setMovimientos([...movimientos, { id: Date.now(), ...mov, ambito }]);
    } else {
      setAviso('');
      setMovimientos([...movimientos, data]);
    }
  }

  async function salir() {
    if (supabase) await supabase.auth.signOut();
    else { salirLocal(); setUsuario(null); }
    setVista('inicio');
  }

  if (!usuario) {
    if (vista === 'inicio') {
      return <Landing onIngresar={() => setVista('ingresar')} onRegistro={() => setVista('registro')} />;
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
              <span>{m.i}</span><b>{m.n}</b>
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
        {modulo === 'Academia' && <Academia cursos={[...cursos, ...extrasCursos]} onAgregar={(c) => setExtrasCursos([...extrasCursos, { id: Date.now(), ...c }])} />}
        {modulo === 'Comunidad' && <Comunidad mentoras={[...mentoras, ...extrasMentoras]} onAgregar={(m) => setExtrasMentoras([...extrasMentoras, { id: Date.now(), ...m }])} />}
        {modulo === 'Mi crecimiento' && (
          <>
            <Crecimiento movimientos={movs} />
            <Metas metas={metas} onAgregar={(m) => setMetas([...metas, { id: Date.now(), ...m }])} />
          </>
        )}
      </main>
    </div>
  );
}
export default App;
