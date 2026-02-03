import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { FiUser, FiAward, FiGrid, FiUsers, FiTool, FiEdit3, FiCheckCircle } from "react-icons/fi";

function ActionTile({ icon, title, subtitle, onClick }) {
  return (
    <div className="action-tile" onClick={onClick} role="button" tabIndex={0}>
      <div className="action-icon">{icon}</div>
      <div className="action-title">{title}</div>
      {subtitle ? <div className="action-sub">{subtitle}</div> : null}
    </div>
  );
}

export default function Home({ user }) {
  const navigate = useNavigate();
  const role = user?.role || "guest";
  const name = user?.name || "gost";

  const actions = useMemo(() => {
    if (role === "admin") {
      return [
        {
          title: "Korisnici",
          subtitle: "Pregled i brisanje naloga",
          icon: <FiUsers size={30} />,
          to: "/admin-users",
        },
        {
          title: "Profil",
          subtitle: "Pregled profila",
          icon: <FiUser size={30} />,
          to: "/profile", // ako admin nema profile page, možemo da stavimo samo home ili da uklonimo
        },
      ];
    }

    if (role === "moderator") {
      return [
        {
          title: "Prijave",
          subtitle: "Odobri/odbij prijavu",
          icon: <FiCheckCircle size={30} />,
          to: "/mod-user-credentials",
        },
        {
          title: "Kredencijali",
          subtitle: "Kreiraj/izmeni",
          icon: <FiEdit3 size={30} />,
          to: "/mod-credentials",
        },
        {
          title: "Veštine",
          subtitle: "Kreiraj/izmeni/obriši",
          icon: <FiTool size={30} />,
          to: "/mod-skills",
        },
      ];
    }

    // user
    return [
      {
        title: "Dostupni kredencijali",
        subtitle: "Prijava za kredencijal",
        icon: <FiGrid size={30} />,
        to: "/available-credentials",
      },
      {
        title: "Moji kredencijali",
        subtitle: "Statusi i rokovi",
        icon: <FiAward size={30} />,
        to: "/my-credentials",
      },
      {
        title: "Moj profil",
        subtitle: "Ažuriraj profil",
        icon: <FiUser size={30} />,
        to: "/profile",
      },
    ];
  }, [role]);

  return (
    <div className="home-stack">
      <Card
        title={`Dobrodošao/la, ${name}`}
        subtitle={
          role === "admin"
            ? "Administratorski pregled sistema"
            : role === "moderator"
            ? "Moderatorski panel"
            : "Tvoj pregled profila i kredencijala"
        }
        actions={<span className="badge badge-neutral">{role}</span>}
      >
        <p className="p">Izaberi akciju ispod.</p>
      </Card>

      <div className="card home-hero">
        <img src="/uvod.png" alt="Uvod" />
      </div>

      <div
        className="home-actions"
        style={{
          gridTemplateColumns: `repeat(${Math.min(actions.length, 4)}, minmax(0, 1fr))`,
        }}
      >
        {actions.map((a) => (
          <ActionTile
            key={a.to}
            icon={a.icon}
            title={a.title}
            subtitle={a.subtitle}
            onClick={() => navigate(a.to)}
          />
        ))}
      </div>
    </div>
  );
}
