// Tarjeta de curso. Si recibe onInscribir, muestra el botón para inscribirse o cancelar.
function CursoCard({ titulo, nivel, descripcion, enlace, inscrita, onInscribir }) {
  return (
    <article className="card">
      <small>{nivel}</small>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      {enlace && <p><a href={enlace} target="_blank" rel="noreferrer">Ver contenido →</a></p>}
      {onInscribir && (
        <button className={inscrita ? 'sec' : ''} onClick={onInscribir}>
          {inscrita ? '✓ Inscrita · Cancelar' : 'Inscribirme'}
        </button>
      )}
    </article>
  );
}
export default CursoCard;
