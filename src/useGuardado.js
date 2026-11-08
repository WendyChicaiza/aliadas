import { useState, useEffect } from 'react';
export function useGuardado(clave, inicial) {
  const [v, setV] = useState(() => {
    try { const g = localStorage.getItem(clave); return g ? JSON.parse(g) : inicial; } catch { return inicial; }
  });
  useEffect(() => { try { localStorage.setItem(clave, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }, [clave, v]);
  return [v, setV];
}
