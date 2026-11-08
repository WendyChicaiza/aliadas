import { useState } from 'react';
import Dashboard from './Dashboard';
import MovimientoCard from './MovimientoCard';

const CATEGORIAS = {
  emprendimiento: {
    ingreso: ['Venta de productos', 'Servicios', 'Otros ingresos'],
    gasto: ['Materia prima', 'Transporte', 'Publicidad', 'Empaques', 'Servicios públicos']
  },
  personal: {
    ingreso: ['Salario', 'Ingreso extra', 'Otros ingresos'],
    gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Ocio', 'Educación']
  }
};

function Finanzas({ movimientos, onAgregar, aviso, nombre, ambito }) {
  const [pestana, setPestana] = useState('registrar');
  const [tipo, setTipo] = useState('ingreso');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [ok, setOk] = useState(false);

  async function guardar() {
    if (!concepto || !monto) return;
    await onAgregar({ concepto, tipo, monto: Number(monto), fecha });
    setConcepto('');
    setMonto('');
    setOk(true);
  }

  return (
    <section>
      <h2>Mis finanzas</h2>
      <div className="tabs">
        {[['registrar', '📝 Registrar'], ['dashboard', '📊 Mi dashboard'], ['historial', '📋 Historial']].map(([id, t]) => (
          <button key={id} className={pestana === id ? 'tab activo' : 'tab'} onClick={() => setPestana(id)}>{t}</button>
        ))}
      </div>
      {aviso && <p className="aviso">{aviso}</p>}

      {pestana === 'registrar' && (
        <article className="card formv">
          <div className="tabs">
            <button className={tipo === 'ingreso' ? 'tab activo' : 'tab'} onClick={() => setTipo('ingreso')}>⬆️ Ingreso</button>
            <button className={tipo === 'gasto' ? 'tab activo' : 'tab'} onClick={() => setTipo('gasto')}>⬇️ Gasto</button>
          </div>
          <div className="chips">
            {CATEGORIAS[ambito][tipo].map((c) => <button key={c} className="sec" onClick={() => setConcepto(c)}>{c}</button>)}
          </div>
          <input placeholder="Concepto (o elige uno arriba)" value={concepto} onChange={(e) => { setConcepto(e.target.value); setOk(false); }} />
          <input placeholder="Monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <button className="cta" onClick={guardar}>Registrar {tipo}</button>
          {ok && <p className="aviso">✓ Registrado. Míralo en "Mi dashboard".</p>}
        </article>
      )}
      {pestana === 'dashboard' && <Dashboard movimientos={movimientos} nombre={nombre} ambito={ambito} />}
      {pestana === 'historial' && (
        <div>
          {movimientos.length === 0 && <p>Aún no hay movimientos.</p>}
          {[...movimientos].reverse().map((m) => (
            <MovimientoCard key={m.id} concepto={m.concepto} tipo={m.tipo} monto={m.monto} fecha={m.fecha} />
          ))}
        </div>
      )}
    </section>
  );
}
export default Finanzas;
