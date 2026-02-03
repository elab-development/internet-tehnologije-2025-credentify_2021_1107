import React from "react";

//reusable komponenta koju cemo cesto koristiti
export default function Card({ title, subtitle, actions, children, footer }) {
  const hasHeader = title || subtitle || actions;

  return (
    <div className="card">
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && <h2 className="h2">{title}.</h2>}
            {subtitle && <p className="p">{subtitle}</p>}
          </div>

          {actions && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {Array.isArray(actions) ? actions.map((a, i) => <React.Fragment key={i}>{a}</React.Fragment>) : actions}
            </div>
          )}
        </div>
      )}

      <div className="card-content">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
