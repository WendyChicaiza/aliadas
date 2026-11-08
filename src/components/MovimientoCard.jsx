function MovimientoCard({ concepto, tipo, monto, fecha }) {
  return (
    <article className={'mov ' + tipo}>
      <div><h3>{concepto}</h3><small>{fecha}</small></div>
      <strong>{tipo === 'ingreso' ? '+' : '-'}${monto}</strong>
    </article>
  );
}
export default MovimientoCard;
