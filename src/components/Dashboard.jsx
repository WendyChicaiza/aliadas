import { useState } from 'react';
import { resumen, porMes } from '../utils';

function Dashboard({ movimientos, nombre, ambito }) {
  const [meta, setMeta] = useState(500);
  const { ingresos, gastos, ganancia } = resumen(movimientos);
  const meses = porMes(movimientos);
  const maximo = Math.max(1, ...meses.map((m) => Math.max(m.ingresos, m.gastos)));
  const recientes = [...movimientos].reverse().slice(0, 5);
  const avance = Math.max(0, Math.min(100, Math.round((ganancia / (meta || 1)) * 100)));
  const personal = ambito === 'personal';
  const consejo = movimientos.length === 0
    ? 'Registra tu primer ingreso o gasto en "Mis finanzas" para ver tu resumen.'
    : personal
      ? (ganancia > 0 ? 'Estás ahorrando. Aparta una parte para tu meta de ahorro antes de gastar.' : 'Tus gastos superan tus ingresos. Revisa tus gastos pequeños del día a día.')
      : ganancia > 0
      ? 'Tus ingresos superan tus gastos. Registra tus costos por producto para saber cuánto ganas en cada uno.'
      : 'Tus gastos superan tus ingresos. Revisa tus costos variables.';

  return (
    <section>
      <h2>Inicio</h2>
      <h3 className="saludo">¡Hola, {nombre}! 👋</h3>
      <div className="grid">
        <article className="stat"><span>Ingresos</span><strong>${ingresos}</strong></article>
        <article className="stat"><span>Gastos</span><strong>${gastos}</strong></article>
        <article className="stat"><span>{personal ? 'Ahorro' : 'Ganancia'}</span><strong>${ganancia}</strong></article>
        <article className="stat">
          <span>Meta de ahorro: $<input className="mini" type="number" value={meta} onChange={(e) => setMeta(Number(e.target.value))} /></span>
          <div className="progreso"><div style={{ width: avance + '%' }}>{avance}%</div></div>
        </article>
      </div>
      <div className="dos">
        <article className="card">
          <h3>Flujo de dinero</h3>
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
          <small>Verde: ingresos · Rojo: gastos</small>
        </article>
        <article className="card">
          <h3>Movimientos recientes</h3>
          {recientes.length === 0 && <p>Aún no hay movimientos.</p>}
          {recientes.map((m) => (
            <div key={m.id} className={'fila-mov ' + m.tipo}>
              <span>{m.concepto}<br /><small>{m.fecha}</small></span>
              <strong>{m.tipo === 'ingreso' ? '+' : '-'}${m.monto}</strong>
            </div>
          ))}
        </article>
      </div>
      <article className="consejo"><h3>Consejo de ALIADAS</h3><p>{consejo}</p></article>
    </section>
  );
}
export default Dashboard;
