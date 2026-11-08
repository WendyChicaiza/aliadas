function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="velo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="fila"><h3>{titulo}</h3><button className="sec" onClick={onCerrar}>✕</button></div>
        {children}
      </div>
    </div>
  );
}
export default Modal;
