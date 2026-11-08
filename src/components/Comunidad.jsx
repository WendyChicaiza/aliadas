import { useState } from 'react';
import MentoraCard from './MentoraCard';
import FormModal from './FormModal';

function Comunidad({ mentoras, onAgregar }) {
  const [abrir, setAbrir] = useState(false);
  return (
    <section>
      <h2>Comunidad</h2>
      <button className="cta" onClick={() => setAbrir(true)}>+ Agregar mentora o aliada</button>
      <div className="grid sep">
        {mentoras.map((m) => <MentoraCard key={m.id} nombre={m.nombre} especialidad={m.especialidad} descripcion={m.descripcion} />)}
      </div>
      {abrir && (
        <FormModal titulo="Nueva mentora o aliada" onGuardar={onAgregar} onCerrar={() => setAbrir(false)}
          campos={[
            { k: 'nombre', l: 'Nombre', req: true },
            { k: 'especialidad', l: 'Especialidad' },
            { k: 'descripcion', l: 'Descripción' }
          ]} />
      )}
    </section>
  );
}
export default Comunidad;
