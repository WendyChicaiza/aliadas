import { useState } from 'react';
import CursoCard from './CursoCard';
import FormModal from './FormModal';

function Academia({ cursos, inscritos, onInscribir, aviso, onAgregar }) {
  const [abrir, setAbrir] = useState(false);
  return (
    <section>
      <h2>Academia</h2>
      {aviso && <p className="aviso">{aviso}</p>}
      <button className="cta" onClick={() => setAbrir(true)}>+ Agregar curso o recurso</button>
      <div className="grid sep">
        {cursos.map((c) => <CursoCard key={c.id} titulo={c.titulo} nivel={c.nivel} descripcion={c.descripcion} enlace={c.enlace}
          inscrita={inscritos.includes(String(c.id))} onInscribir={c.local ? undefined : () => onInscribir(String(c.id))} />)}
      </div>
      {abrir && (
        <FormModal titulo="Nuevo curso o recurso" onGuardar={onAgregar} onCerrar={() => setAbrir(false)}
          campos={[
            { k: 'titulo', l: 'Título', req: true },
            { k: 'nivel', opciones: ['Básico', 'Intermedio', 'Avanzado'] },
            { k: 'descripcion', l: 'Descripción' },
            { k: 'enlace', l: 'Enlace al contenido (video, PDF, página)' }
          ]} />
      )}
    </section>
  );
}
export default Academia;
