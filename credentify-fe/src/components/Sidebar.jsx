import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import Button from "./Button";

export default function Sidebar({ isAuthed, role, onLogout }) {
  const items = useMemo(() => {
    if (!isAuthed) {
      return [
        { label: "Login.", to: "/login" },
        { label: "Register.", to: "/register" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "Home", to: "/home" },
        { label: "Korisnici", to: "/admin-users" },
      ];
    }

    if (role === "moderator") {
      return [
        { label: "Home", to: "/home" },
        { label: "Skills", to: "/mod-skills" },
        { label: "Credentials", to: "/mod-credentials" },
        { label: "Users & Credentials", to: "/mod-user-credentials" },
      ];
    }

    return [
      { label: "Home", to: "/home" },
      { label: "Moj profil", to: "/profile" },
      { label: "Moji kredencijali", to: "/my-credentials" },
      { label: "Dostupni kredencijali", to: "/available-credentials" },
    ];
  }, [isAuthed, role]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge" />
        <div className="brand-title">Credentify</div>
      </div>

      <div className="nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
          >
            {it.label}
          </NavLink>
        ))}
      </div>

      {isAuthed && (
        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          <div className="p">
            Uloga: <span style={{ fontWeight: 800, color: "var(--c-yale-blue)" }}>{role}.</span>
          </div>

          <Button variant="ghost" type="button" onClick={onLogout}>
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}
