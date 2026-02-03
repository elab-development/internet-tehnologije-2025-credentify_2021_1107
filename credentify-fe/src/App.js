import React, { useMemo, useState } from "react";
import "./App.css";

function Button({ variant = "primary", children, ...props }) {
  const cls = `btn ${
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : "btn-ghost"
  }`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

function Card({ title, subtitle, actions, children, footer }) {
  return (
    <div className="card">
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div>
            {title && <h2 className="h2">{title}</h2>}
            {subtitle && <p className="p">{subtitle}</p>}
          </div>
          {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

function Badge({ tone = "neutral", children }) {
  const cls =
    tone === "success"
      ? "badge badge-success"
      : tone === "warning"
      ? "badge badge-warning"
      : tone === "danger"
      ? "badge badge-danger"
      : "badge badge-neutral";
  return <span className={cls}>{children}</span>;
}

function ProfileCard({ user, onSave }) {
  const [profileInfo, setProfileInfo] = useState(user.profile_info);

  return (
    <Card
      title="Moj profil"
      subtitle="Uredi samo profile info, ostalo je read-only."
      actions={<Badge tone="neutral">{user.role}</Badge>}
      footer={
        <Button variant="primary" onClick={() => onSave(profileInfo)}>
          Sačuvaj
        </Button>
      }
    >
      <div className="profile">
        <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
        <div className="kv">
          <div className="kv-row">
            <div className="kv-key">Ime.</div>
            <div className="kv-val">{user.name}.</div>
          </div>
          <div className="kv-row">
            <div className="kv-key">Email.</div>
            <div className="kv-val">{user.email}.</div>
          </div>

          <div className="field" style={{ marginTop: 8 }}>
            <div className="label">Profile info.</div>
            <textarea
              className="textarea"
              value={profileInfo || ""}
              onChange={(e) => setProfileInfo(e.target.value)}
              placeholder="Unesi kratak opis profila."
            />
            <div className="helper">Preporuka: do 2–3 rečenice.</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CredentialCard({ credential, onApply }) {
  return (
    <div className="card">
      <div className="card-content credential-card">
        <div className="credential-title">{credential.name}.</div>

        <div className="credential-meta">
          <Badge tone="neutral">{credential.category}</Badge>
          <Badge tone="neutral">{credential.issuer}</Badge>
          <Badge tone="neutral">{credential.validity_months} mes.</Badge>
        </div>

        <div className="tags">
          {credential.skills.map((s) => (
            <span className="tag" key={s}>
              {s}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <Button variant="primary" onClick={() => onApply(credential.id)}>
            Prijavi se
          </Button>
          <Button variant="ghost">Detalji</Button>
        </div>
      </div>
    </div>
  );
}

function SimpleTable({ rows }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Kredencijal.</th>
            <th>Status.</th>
            <th>Issued.</th>
            <th>Expiry.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 700, color: "#353535" }}>{r.credential}.</td>
              <td>
                <Badge
                  tone={
                    r.status === "Approved"
                      ? "success"
                      : r.status === "Pending"
                      ? "warning"
                      : r.status === "Rejected"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {r.status}
                </Badge>
              </td>
              <td>{r.issued || "-"}</td>
              <td>{r.expiry || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");

  const user = useMemo(
    () => ({
      name: "Nikola",
      email: "nikola@credentify.test",
      role: "user",
      profile_info: "Standardni korisnik Credentify aplikacije. Prati svoje kredencijale i veštine.",
    }),
    []
  );

  const credentials = useMemo(
    () => [
      {
        id: 1,
        name: "Backend Development (Laravel) Certificate",
        category: "Backend",
        issuer: "University of Example",
        validity_months: 24,
        skills: ["Laravel", "REST APIs"],
      },
      {
        id: 2,
        name: "SQL & Relational Databases Certificate",
        category: "Database",
        issuer: "Institute of Data",
        validity_months: 36,
        skills: ["SQL", "PostgreSQL"],
      },
      {
        id: 3,
        name: "DevOps Foundations Certificate",
        category: "DevOps",
        issuer: "Academy of Engineering",
        validity_months: 24,
        skills: ["Docker", "CI/CD"],
      },
    ],
    []
  );

  const myRows = useMemo(
    () => [
      { id: 11, credential: "Backend Development (Laravel) Certificate", status: "Pending", issued: null, expiry: null },
      { id: 12, credential: "SQL & Relational Databases Certificate", status: "Approved", issued: "2026-01-12", expiry: "2029-01-12" },
    ],
    []
  );

  const filteredCredentials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
  }, [credentials, search]);

  function onApply(id) {
    alert(`Prijava poslata za credential_id=${id}.`);
  }

  function onSaveProfile(profileInfo) {
    alert(`Profile info sačuvan: ${profileInfo}`);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" />
          <div className="brand-title">Credentify.</div>
        </div>

        <div className="nav">
          <button className={`nav-item ${page === "dashboard" ? "is-active" : ""}`} onClick={() => setPage("dashboard")}>
            Dashboard.
          </button>
          <button className={`nav-item ${page === "available" ? "is-active" : ""}`} onClick={() => setPage("available")}>
            Dostupni kredencijali.
          </button>
          <button className={`nav-item ${page === "my" ? "is-active" : ""}`} onClick={() => setPage("my")}>
            Moji kredencijali.
          </button>
          <button className={`nav-item ${page === "profile" ? "is-active" : ""}`} onClick={() => setPage("profile")}>
            Moj profil.
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="h1">
              {page === "dashboard"
                ? "Dashboard."
                : page === "available"
                ? "Dostupni kredencijali."
                : page === "my"
                ? "Moji kredencijali."
                : "Moj profil."}
            </h1>
            <p className="p">Uniformni UI: isti button, card, tabela i forma na svakoj stranici.</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary">Help</Button>
            <Button variant="ghost">Logout</Button>
          </div>
        </div>

        <div className="container">
          {page === "dashboard" && (
            <>
              <Card
                title="Brzi pregled"
                subtitle="Primer kartice, badge-ova i akcija."
                actions={<Badge tone="success">Active</Badge>}
                footer={<Button variant="primary" onClick={() => setPage("available")}>Pregledaj kredencijale</Button>}
              >
                <p className="p">
                  Ovaj layout koristi iste klase za kartice, dugmad, tipografiju i spacing. Nema gradijenata i nema “AI” stila.
                </p>
              </Card>

              <Card title="Moji kredencijali" subtitle="Tabela koristi iste klase globalno.">
                <SimpleTable rows={myRows} />
              </Card>
            </>
          )}

          {page === "available" && (
            <Card
              title="Prijavi se na kredencijal"
              subtitle="Pretraga + kartice. Jedan sistem klasa."
              actions={
                <div className="search">
                  <input
                    className="input search-input"
                    placeholder="Pretraga po nazivu, kategoriji ili issuer-u."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" onClick={() => setSearch("")}>
                    Reset
                  </Button>
                </div>
              }
            >
              <div className="grid">
                {filteredCredentials.map((c) => (
                  <CredentialCard key={c.id} credential={c} onApply={onApply} />
                ))}
              </div>
            </Card>
          )}

          {page === "my" && (
            <Card title="Lista mojih kredencijala" subtitle="Isti table stil svuda.">
              <SimpleTable rows={myRows} />
            </Card>
          )}

          {page === "profile" && <ProfileCard user={user} onSave={onSaveProfile} />}
        </div>
      </main>
    </div>
  );
}
