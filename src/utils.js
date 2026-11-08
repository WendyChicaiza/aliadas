export function resumen(movs) {
  const ingresos = movs.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const gastos = movs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
  return { ingresos, gastos, ganancia: ingresos - gastos };
}
const NOMBRES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export function porMes(movs) {
  const meses = [...new Set(movs.map(m => m.fecha.slice(0, 7)))].sort();
  return meses.map(clave => ({
    mes: NOMBRES[Number(clave.slice(5)) - 1],
    ...resumen(movs.filter(m => m.fecha.startsWith(clave)))
  }));
}
