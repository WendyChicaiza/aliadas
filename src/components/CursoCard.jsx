import { useState } from 'react';

function CursoCard({ titulo, nivel, descripcion, enlace }) {
  const [completado, setCompletado] = useState(false);
  return (
    <article className="card">
      <small>{nivel}</small>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      {enlace && <p><a href={enlace} target="_blank" rel="noreferrer">Ver contenido →</a></p>}
      <button onClick={() => setCompletado(!completado)}>{completado ? '✓ Completado' : 'Marcar como completado'}</button>
    </article>
  );
}
export default CursoCard;
