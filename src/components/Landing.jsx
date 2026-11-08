import { useState } from 'react';
import { MODULOS } from '../modulos';

const BENEFICIOS = [
  { id: 1, t: 'Tus cuentas claras', d: 'Registra ingresos y gastos y mira tu ganancia real.' },
  { id: 2, t: 'Aprende a tu ritmo', d: 'Mini cursos de finanzas y de cómo digitalizar tu negocio.' },
  { id: 3, t: 'Nunca estás sola', d: 'Mentoras y una comunidad de emprendedoras.' }
];
const PASOS = ['Crea tu cuenta', 'Registra tus movimientos', 'Mira cómo crece tu negocio'];
const COMUNIDAD = [
  { id: 1, n: 'Emprendedora 1', f: 'Ejemplo: aquí irá el testimonio de una usuaria real.' },
  { id: 2, n: 'Emprendedora 2', f: 'Ejemplo: aquí irá el testimonio de una usuaria real.' }
];

function Landing({ onIngresar, onRegistro }) {
  const [ventas, setVentas] = useState(850);
  const [costos, setCostos] = useState(520);
  const ganancia = ventas - costos;
  const margen = ventas ? Math.round((ganancia / ventas) * 100) : 0;

  return (
    <div className="landing">
      <header className="topbar">
        <img src="logo.png" alt="ALIADAS" className="logo-img" />
        <nav className="links"><a href="#beneficios">Beneficios</a><a href="#pasos">Cómo funciona</a><a href="#comunidad">Comunidad</a></nav>
        <span><button className="sec" onClick={onIngresar}>Ingresar</button> <button className="cta" onClick={onRegistro}>Crear cuenta</button></span>
      </header>

      <section className="hero">
        <div>
          <h1>Impulsamos a mujeres que emprenden</h1>
          <p>Organiza tu dinero, aprende finanzas y crece acompañada de una comunidad.</p>
          <button className="cta" onClick={onRegistro}>Empieza gratis</button>
        </div>
        <article className="calc">
          <h3>Calcula tu ganancia</h3>
          <label>Ventas del mes <input type="number" value={ventas} onChange={(e) => setVentas(Number(e.target.value))} /></label>
          <label>Costos del mes <input type="number" value={costos} onChange={(e) => setCostos(Number(e.target.value))} /></label>
          <p>Ganancia: <strong>${ganancia}</strong> · Margen: <strong>{margen}%</strong></p>
        </article>
      </section>

      <section className="bloque">
        <h2>Nuestra propuesta de valor</h2>
        <p className="centro">Una plataforma digital que acompaña a mujeres que comienzan un emprendimiento, ayudándolas a organizar sus finanzas, desarrollar habilidades empresariales y conectarse con oportunidades de mentoría.</p>
        <div className="grid">
          {MODULOS.map((m) => <article key={m.n} className="card"><h3>{m.i} {m.n}</h3><p>{m.d}</p></article>)}
        </div>
      </section>

      <section id="beneficios" className="bloque">
        <h2>Hecha a tu medida</h2>
        <div className="grid">
          {BENEFICIOS.map((b) => <article key={b.id} className="card"><h3>{b.t}</h3><p>{b.d}</p></article>)}
        </div>
      </section>

      <section id="pasos" className="bloque rosa">
        <h2>Así de fácil</h2>
        <div className="grid">
          {PASOS.map((p, i) => <article key={p} className="card"><span className="num">{i + 1}</span><h3>{p}</h3></article>)}
        </div>
      </section>

      <section id="comunidad" className="bloque">
        <h2>Nuestra comunidad</h2>
        <div className="grid">
          {COMUNIDAD.map((c) => <article key={c.id} className="card"><h3>{c.n}</h3><p>{c.f}</p></article>)}
        </div>
      </section>

      <footer className="pie">
        <p>ALIADAS · Educación, finanzas y comunidad</p>
        <p><small>Contacto: wendyestefi1999@gmail.com</small></p>
      </footer>
    </div>
  );
}
export default Landing;
