// Íconos del menú: líneas blancas que toman el color del texto (currentColor).
const RUTAS = {
  inicio: ['M3 11l9-8 9 8', 'M5 10v10h5v-6h4v6h5V10'],
  finanzas: ['M3 7a2 2 0 0 1 2-2h13v4', 'M3 7v11a2 2 0 0 0 2 2h14V9H5a2 2 0 0 1-2-2z', 'M16 14.5h2'],
  academia: ['M2 9l10-5 10 5-10 5z', 'M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5'],
  comunidad: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M3 20a6 6 0 0 1 12 0', 'M16 5.2a3 3 0 0 1 0 5.6', 'M17 14.5a6 6 0 0 1 4 5.5'],
  crecimiento: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6']
};

function Icono({ nombre }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(RUTAS[nombre] || []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
export default Icono;
