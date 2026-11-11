import { useState, useEffect } from 'react';
import { pedir } from './api';

// Trae cursos y mentoras del backend (MongoDB). Si el backend no responde,
// usa los archivos de ejemplo de public/ para que la página nunca quede vacía.
export function useCatalogo() {
  const [cursos, setCursos] = useState([]);
  const [mentoras, setMentoras] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [c, m] = await Promise.all([pedir('/api/cursos'), pedir('/api/mentoras')]);
        setCursos(c);
        setMentoras(m);
      } catch {
        setCursos(await (await fetch('cursos.json')).json());
        setMentoras(await (await fetch('mentoras.json')).json());
      }
      setCargando(false);
    }
    cargar();
  }, []);

  return { cursos, mentoras, cargando };
}
