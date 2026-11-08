import { porMes, resumen } from '../utils';

function Crecimiento({ movimientos }) {
  const meses = porMes(movimientos);
  const maximo = Math.max(1, ...meses.map((m) => Math.max(m.ingresos, m.gastos)));
  const { ingresos, ganancia } = resumen(movimientos);
  const margen = ingresos ? Math.round((ganancia / ingresos) * 100) : 0;
  const mesesGanancia = meses.filter((m) => m.ganancia > 0).length;

  return (
    <section>
      <h2>Mi crecimiento y perfil financiero</h2>
      <div className="grid">
        <article className="stat"><span>Margen de ganancia</span><strong>{margen}%</strong></article>
        <article className="stat"><span>Meses con ganancia</span><strong>{mesesGanancia} de {meses.length}</strong></article>
      </div>
      <h3>Ingresos vs gastos por mes</h3>
      <div className="barras">
        {meses.map((m) => (
          <div key={m.mes} className="grupo">
            <div className="par">
              <div className="barra ing" style={{ height: (m.ingresos / maximo) * 100 + '%' }} title={'Ingresos $' + m.ingresos} />
              <div className="barra gas" style={{ height: (m.gastos / maximo) * 100 + '%' }} title={'Gastos $' + m.gastos} />
            </div>
            <small>{m.mes}</small>
          </div>
        ))}
      </div>
      <p><small>Verde: ingresos · Rojo: gastos</small></p>
    </section>
  );
}
export default Crecimiento;
