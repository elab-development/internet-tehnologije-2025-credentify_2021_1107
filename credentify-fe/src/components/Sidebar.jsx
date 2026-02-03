import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import Button from "./Button";

//ikonice za lepsi side bar
import {
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiGrid,
  FiUsers,
  FiAward,
  FiTool,
} from "react-icons/fi";

function Icon({ name }) {
  const size = 18;

  const map = {
    home: <FiHome size={size} />,
    login: <FiLogIn size={size} />,
    register: <FiUserPlus size={size} />,

    profile: <FiUser size={size} />,
    my_credentials: <FiAward size={size} />,
    available_credentials: <FiGrid size={size} />,

    admin_users: <FiUsers size={size} />,

    mod_skills: <FiTool size={size} />,
    mod_credentials: <FiAward size={size} />,
    mod_user_credentials: <FiUsers size={size} />,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
      }}
    >
      {map[name] || <FiHome size={size} />}
    </span>
  );
}

export default function Sidebar({ isAuthed, role, onLogout }) {
  const items = useMemo(() => {
    if (!isAuthed) {
      return [
        { label: "Login", to: "/login", icon: "login" },
        { label: "Register", to: "/register", icon: "register" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "Home", to: "/home", icon: "home" },
        { label: "Korisnici", to: "/admin-users", icon: "admin_users" },
      ];
    }

    if (role === "moderator") {
      return [
        { label: "Home", to: "/home", icon: "home" },
        { label: "Skills", to: "/mod-skills", icon: "mod_skills" },
        { label: "Credentials", to: "/mod-credentials", icon: "mod_credentials" },
        { label: "Users & Credentials", to: "/mod-user-credentials", icon: "mod_user_credentials" },
      ];
    }

    return [
      { label: "Home", to: "/home", icon: "home" },
      { label: "Moj profil", to: "/profile", icon: "profile" },
      { label: "Moji kredencijali", to: "/my-credentials", icon: "my_credentials" },
      { label: "Dostupni kredencijali", to: "/available-credentials", icon: "available_credentials" },
    ];
  }, [isAuthed, role]);

  return (
    <aside className="sidebar">
      <div className="brand">
        {/* Logo iz public foldera */}
        <img
          src="/credentify logo.png"
          alt="Credentify logo"
          className="brand-logo"
        />
      </div>

      <div className="nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <Icon name={it.icon} />
            <span>{it.label}</span>
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
