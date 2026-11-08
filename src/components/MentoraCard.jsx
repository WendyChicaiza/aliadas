import { useState } from 'react';

function MentoraCard({ nombre, especialidad, descripcion }) {
  const [solicitada, setSolicitada] = useState(false);
  return (
    <article className="card">
      <h3>{nombre}</h3>
      <small>{especialidad}</small>
      <p>{descripcion}</p>
      <button disabled={solicitada} onClick={() => setSolicitada(true)}>
        {solicitada ? 'Mentoría solicitada ✓' : 'Solicitar mentoría'}
      </button>
    </article>
  );
}
export default MentoraCard;
