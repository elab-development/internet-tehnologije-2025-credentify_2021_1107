import React from "react";

//reusable komponenta, koristice se za autentifikaciju i bilo koje popunjavanje
function Form({ onSubmit, actions, children }) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {children}
      {actions && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>{actions}</div>}
    </form>
  );
}

Form.Field = function Field({ label, helper, error, children }) {
  return (
    <div className="field">
      {label && <div className="label">{label}.</div>}
      {children}
      {error ? <div className="helper" style={{ color: "var(--c-danger)" }}>{error}.</div> : helper ? <div className="helper">{helper}</div> : null}
    </div>
  );
};

export default Form;
