import React, { useEffect } from "react";

//reusable modal svaki put kad nesto menjamo da se otvori
export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            {title ? <h2 className="h2">{title}</h2> : null}
          </div>
        </div>

        <div className="card-content">{children}</div>

        {footer ? <div className="card-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
