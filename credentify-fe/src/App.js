import React, { useMemo, useState } from "react";
import "./App.css";

import Button from "./components/Button";
import Card from "./components/Card";
import Table from "./components/Table";
import Form from "./components/Form";

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
          <Button variant="primary" type="button" onClick={() => onApply(credential.id)}>
            Prijavi se
          </Button>
          <Button variant="ghost" type="button">
            Detalji
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");

  const [profileInfo, setProfileInfo] = useState(
    "Standardni korisnik Credentify aplikacije. Prati svoje kredencijale i veštine."
  );

  const user = useMemo(
    () => ({
      name: "Nikola",
      email: "nikola@credentify.test",
      role: "user",
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
      {
        id: 11,
        credential: "Backend Development (Laravel) Certificate",
        status: "Pending",
        issued: null,
        expiry: null,
      },
      {
        id: 12,
        credential: "SQL & Relational Databases Certificate",
        status: "Approved",
        issued: "2026-01-12",
        expiry: "2029-01-12",
      },
    ],
    []
  );

  const filteredCredentials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q)
    );
  }, [credentials, search]);

  function onApply(id) {
    alert(`Prijava poslata za credential_id=${id}.`);
  }

  function onSaveProfile() {
    alert(`Profile info sačuvan: ${profileInfo}`);
  }

  const myCredentialsColumns = useMemo(
    () => [
      {
        key: "credential",
        header: "Kredencijal",
        render: (row) => <span style={{ fontWeight: 700 }}>{row.credential}.</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge
            tone={
              row.status === "Approved"
                ? "success"
                : row.status === "Pending"
                ? "warning"
                : row.status === "Rejected"
                ? "danger"
                : "neutral"
            }
          >
            {row.status}
          </Badge>
        ),
      },
      { key: "issued", header: "Issued", render: (row) => (row.issued ? row.issued : "-") },
      { key: "expiry", header: "Expiry", render: (row) => (row.expiry ? row.expiry : "-") },
    ],
    []
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" />
          <div className="brand-title">Credentify.</div>
        </div>

        <div className="nav">
          <button
            className={`nav-item ${page === "dashboard" ? "is-active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard.
          </button>
          <button
            className={`nav-item ${page === "available" ? "is-active" : ""}`}
            onClick={() => setPage("available")}
          >
            Dostupni kredencijali.
          </button>
          <button
            className={`nav-item ${page === "my" ? "is-active" : ""}`}
            onClick={() => setPage("my")}
          >
            Moji kredencijali.
          </button>
          <button
            className={`nav-item ${page === "profile" ? "is-active" : ""}`}
            onClick={() => setPage("profile")}
          >
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
            <p className="p">
              UI koristi samo: Card, Table, Form i Button. Klase su iste svuda.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" type="button">
              Help
            </Button>
            <Button variant="ghost" type="button">
              Logout
            </Button>
          </div>
        </div>

        <div className="container">
          {page === "dashboard" && (
            <>
              <Card
                title="Brzi pregled"
                subtitle="Primer kartice i akcija."
                actions={<Badge tone="success">Active</Badge>}
                footer={
                  <Button variant="primary" type="button" onClick={() => setPage("available")}>
                    Pregledaj kredencijale
                  </Button>
                }
              >
                <p className="p">
                  Ovo je demo layout. Kasnije ćemo zameniti dummy podatke API pozivima, ali UI
                  struktura ostaje ista.
                </p>
              </Card>

              <Card title="Moji kredencijali" subtitle="Tabela koristi isti stil globalno.">
                <Table columns={myCredentialsColumns} rows={myRows} rowKey="id" />
              </Card>
            </>
          )}

          {page === "available" && (
            <Card
              title="Prijava za kredencijal"
              subtitle="Pretraga + kartice."
              actions={
                <div className="search">
                  <input
                    className="input search-input"
                    placeholder="Pretraga po nazivu, kategoriji ili issuer-u."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" type="button" onClick={() => setSearch("")}>
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
            <Card title="Lista mojih kredencijala" subtitle="Isti Table stil na svim stranicama.">
              <Table columns={myCredentialsColumns} rows={myRows} rowKey="id" />
            </Card>
          )}

          {page === "profile" && (
            <Card
              title="Moj profil"
              subtitle="Ažurira se samo profile info."
              actions={<Badge tone="neutral">{user.role}</Badge>}
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

                  <div style={{ marginTop: 8 }}>
                    <Form
                      onSubmit={onSaveProfile}
                      actions={
                        <>
                          <Button variant="secondary" type="button" onClick={() => setProfileInfo("")}>
                            Reset
                          </Button>
                          <Button variant="primary" type="submit">
                            Sačuvaj
                          </Button>
                        </>
                      }
                    >
                      <Form.Field label="Profile info" helper="Preporuka: do 2–3 rečenice.">
                        <textarea
                          className="textarea"
                          value={profileInfo}
                          onChange={(e) => setProfileInfo(e.target.value)}
                          placeholder="Unesi kratak opis profila."
                        />
                      </Form.Field>
                    </Form>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
