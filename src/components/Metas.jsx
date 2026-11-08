import { useState } from 'react';
import FormModal from './FormModal';

function Metas({ metas, onAgregar }) {
  const [abrir, setAbrir] = useState(false);
  return (
    <section className="sep">
      <h3>Mis metas de ahorro y crecimiento</h3>
      <button className="cta" onClick={() => setAbrir(true)}>+ Agregar meta</button>
      <div className="grid sep">
        {metas.map((m) => {
          const p = Math.min(100, Math.round((Number(m.actual) / (Number(m.objetivo) || 1)) * 100));
          return (
            <article key={m.id} className="card">
              <h3>{m.nombre}</h3>
              <small>${m.actual} de ${m.objetivo}</small>
              <div className="progreso"><div style={{ width: p + '%' }}>{p}%</div></div>
            </article>
          );
        })}
      </div>
      {abrir && (
        <FormModal titulo="Nueva meta" onGuardar={onAgregar} onCerrar={() => setAbrir(false)}
          campos={[
            { k: 'nombre', l: 'Nombre de la meta', req: true },
            { k: 'objetivo', l: 'Monto objetivo', tipo: 'number', req: true },
            { k: 'actual', l: 'Monto actual', tipo: 'number' }
          ]} />
      )}
    </section>
  );
}
export default Metas;
