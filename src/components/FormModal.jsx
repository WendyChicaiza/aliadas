import { useState } from 'react';
import Modal from './Modal';

function FormModal({ titulo, campos, onGuardar, onCerrar }) {
  const [v, setV] = useState({});
  const set = (k, x) => setV({ ...v, [k]: x });
  function guardar() {
    if (campos.some((c) => c.req && !v[c.k])) return;
    const base = {};
    campos.forEach((c) => { if (c.opciones) base[c.k] = c.opciones[0]; });
    onGuardar({ ...base, ...v });
    onCerrar();
  }
  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <div className="formv">
        {campos.map((c) => c.opciones ? (
          <select key={c.k} value={v[c.k] || c.opciones[0]} onChange={(e) => set(c.k, e.target.value)}>
            {c.opciones.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input key={c.k} type={c.tipo || 'text'} placeholder={c.l} value={v[c.k] || ''} onChange={(e) => set(c.k, e.target.value)} />
        ))}
        <button className="cta" onClick={guardar}>Guardar</button>
      </div>
    </Modal>
  );
}
export default FormModal;
