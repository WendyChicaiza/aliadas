import { useCatalogo } from '../useCatalogo';

// Catálogo público: cursos (productos) y mentoras (servicios) que ofrece ALIADAS.
function Catalogo() {
  const { cursos, mentoras, cargando } = useCatalogo();
  return (
    <section id="catalogo" className="bloque">
      <h2>Catálogo ALIADAS</h2>
      {cargando && <p className="centro">Cargando catálogo…</p>}
      {!cargando && (
        <>
          <h3 className="centro">Cursos y recursos</h3>
          <div className="grid">
            {cursos.map((c) => (
              <article key={c.id} className="card aparece">
                <small>{c.nivel}</small>
                <h3>{c.titulo}</h3>
                <p>{c.descripcion}</p>
                {c.enlace && <p><a href={c.enlace} target="_blank" rel="noreferrer">Ver contenido →</a></p>}
              </article>
            ))}
          </div>
          <h3 className="centro sep">Mentoras</h3>
          <div className="grid">
            {mentoras.map((m) => (
              <article key={m.id} className="card aparece">
                <small>{m.especialidad}</small>
                <h3>{m.nombre}</h3>
                <p>{m.descripcion}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
export default Catalogo;
