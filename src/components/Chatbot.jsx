import { useState, useRef, useEffect } from 'react';
import { API } from '../api';

const SALUDO = { rol: 'asistente', texto: '¡Hola! Soy el asistente de ALIADAS 💜 Pregúntame por nuestros cursos y mentorías, o pídeme un texto listo para tu negocio.' };

function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([SALUDO]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const fin = useRef(null);

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes, cargando]);

  async function enviar() {
    const texto = entrada.trim();
    if (!texto || cargando) return;
    const nuevos = [...mensajes, { rol: 'usuaria', texto }];
    setMensajes(nuevos);
    setEntrada('');
    setError('');
    setCargando(true);
    try {
      // slice(1) quita el saludo inicial: la IA debe empezar con un mensaje de la usuaria
      const r = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevos.slice(1) })
      });
      const d = await r.json();
      if (!r.ok) throw new Error((d.error || 'No se pudo responder.') + (d.detalle?.[0] ? ' (' + d.detalle[0] + ')' : ''));
      setMensajes([...nuevos, { rol: 'asistente', texto: d.respuesta }]);
    } catch (e) {
      // TypeError = no hubo conexión con el servidor
      setError(e instanceof TypeError ? 'No pude conectar con el asistente. Intenta más tarde.' : e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button className="chat-btn" onClick={() => setAbierto(!abierto)} aria-label="Abrir asistente">
        {abierto ? '✕' : '💬'}
      </button>
      {abierto && (
        <div className="chat-panel">
          <div className="chat-cab">Asistente ALIADAS</div>
          <div className="chat-msgs">
            {mensajes.map((m, i) => <p key={i} className={'burbuja ' + m.rol}>{m.texto}</p>)}
            {cargando && <p className="burbuja asistente">Escribiendo…</p>}
            {error && <p className="aviso">{error}</p>}
            <div ref={fin} />
          </div>
          <div className="chat-in">
            <input value={entrada} placeholder="Escribe tu pregunta" onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} />
            <button className="cta" onClick={enviar} disabled={cargando}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}
export default Chatbot;
