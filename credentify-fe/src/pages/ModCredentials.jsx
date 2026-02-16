import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";
import Modal from "../components/Modal";

function extractError(e, fallback) {
  const data = e?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return data?.message || fallback;
}

export default function ModCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [q, setQ] = useState("");

  // modal state.
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create i edit.
  const [selected, setSelected] = useState(null);

  // form fields.
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [validityMonths, setValidityMonths] = useState("");
  const [issuerId, setIssuerId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // skills: max 2.
  const [skill1Id, setSkill1Id] = useState("");
  const [skill2Id, setSkill2Id] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  async function fetchAll() {
    setErr("");
    setOk("");
    setLoading(true);

    try {
      const [cRes, iRes, sRes] = await Promise.allSettled([
        axios.get("/credentials"),
        axios.get("/issuers"),
        axios.get("/skills"),
      ]);

      if (cRes.status === "fulfilled") {
        setCredentials(cRes.value.data?.data?.credentials || []);
      } else {
        setCredentials([]);
        setErr(extractError(cRes.reason, "Greška pri učitavanju kredencijala"));
      }

      if (iRes.status === "fulfilled") {
        // očekivano: data.issuers (ali ostavljeno robustno).
        const list =
          iRes.value.data?.data?.issuers ||
          iRes.value.data?.data ||
          iRes.value.data?.issuers ||
          [];
        setIssuers(Array.isArray(list) ? list : []);
      } else {
        setIssuers([]);
      }

      if (sRes.status === "fulfilled") {
        setSkills(sRes.value.data?.data?.skills || []);
      } else {
        setSkills([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return credentials;

    return credentials.filter((c) => {
      const a = (c?.name || "").toLowerCase();
      const b = (c?.category || "").toLowerCase();
      const issuer = (c?.issuer?.name || "").toLowerCase();
      const sk = Array.isArray(c?.skills) ? c.skills.map((x) => (x?.name || "").toLowerCase()).join(" ") : "";
      return a.includes(s) || b.includes(s) || issuer.includes(s) || sk.includes(s);
    });
  }, [credentials, q]);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setName("");
    setCategory("");
    setValidityMonths("");
    setIssuerId("");
    setIsActive(true);
    setSkill1Id("");
    setSkill2Id("");
    setSaveErr("");
    setOk("");
    setOpen(true);
  }

  function openEdit(row) {
    setMode("edit");
    setSelected(row);

    setName(row?.name || "");
    setCategory(row?.category || "");
    setValidityMonths(row?.validity_months ? String(row.validity_months) : "");
    setIssuerId(row?.issuer?.id ? String(row.issuer.id) : String(row?.issuer_id || ""));
    setIsActive(!!row?.is_active);

    const sk = Array.isArray(row?.skills) ? row.skills : [];
    setSkill1Id(sk[0]?.id ? String(sk[0].id) : "");
    setSkill2Id(sk[1]?.id ? String(sk[1].id) : "");

    setSaveErr("");
    setOk("");
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setSelected(null);
    setSaveErr("");
  }

  async function save() {
    setSaveErr("");
    setOk("");
    setSaving(true);

    try {
      const nm = (name || "").trim();
      if (!nm) {
        setSaveErr("Naziv je obavezan.");
        return;
      }

      if (!issuerId) {
        setSaveErr("Issuer je obavezan.");
        return;
      }

      if (!skill1Id) {
        setSaveErr("Izaberi bar jednu veštinu.");
        return;
      }

      if (skill2Id && skill2Id === skill1Id) {
        setSaveErr("Skill 1 i Skill 2 ne smeju biti isti.");
        return;
      }

      const skill_ids = [skill1Id, skill2Id].filter(Boolean).map((x) => Number(x));

      const vm = (validityMonths || "").trim();
      const payload = {
        name: nm,
        category: (category || "").trim() ? category.trim() : null,
        validity_months: vm ? Number(vm) : null,
        issuer_id: Number(issuerId),
        is_active: !!isActive,
        skill_ids,
      };

      if (mode === "create") {
        await axios.post("/credentials", payload);
        setOk("Kredencijal je uspešno kreiran.");
      } else {
        await axios.put(`/credentials/${selected?.id}`, payload);
        setOk("Kredencijal je uspešno izmenjen.");
      }

      await fetchAll();
      closeModal();
    } catch (e) {
      setSaveErr(extractError(e, "Čuvanje nije uspelo"));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "name",
        header: "Naziv",
        render: (c) => <span style={{ fontWeight: 800, color: "var(--c-graphite)" }}>{c.name || "-"}</span>,
      },
      {
        key: "issuer",
        header: "Issuer",
        render: (c) => <span className="badge badge-neutral">{c?.issuer?.name || "-"}</span>,
      },
      {
        key: "category",
        header: "Kategorija",
        render: (c) => (c.category ? <span className="badge badge-neutral">{c.category}</span> : "-"),
      },
      {
        key: "skills",
        header: "Veštine",
        render: (c) => {
          const sk = Array.isArray(c?.skills) ? c.skills : [];
          if (!sk.length) return "-";
          return (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sk.map((s) => (
                <span className="tag" key={s.id || s.name}>
                  {s.name}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        key: "validity_months",
        header: "Validnost",
        render: (c) => (c.validity_months ? `${c.validity_months} mes` : "-"),
      },
      {
        key: "is_active",
        header: "Aktivan",
        render: (c) =>
          c.is_active ? <span className="badge badge-success">Da</span> : <span className="badge badge-danger">Ne</span>,
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Izmeni",
        variant: "primary",
        onClick: openEdit,
      },
    ],
    []
  );

  return (
    <>
      <Card
        title="Kredencijali"
        subtitle="Moderator pregled i upravljanje kredencijalima."
        actions={[
          <Button key="refresh" variant="secondary" type="button" onClick={fetchAll} disabled={loading}>
            {loading ? "Učitavam..." : "Osveži"}
          </Button>,
          <Button key="add" variant="primary" type="button" onClick={openCreate} disabled={loading}>
            + Novi kredencijal
          </Button>,
        ]}
      >
        {err ? (
          <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
            {err}.
          </div>
        ) : null}

        {ok ? (
          <div className="helper" style={{ color: "var(--c-stormy-teal)", marginBottom: 10 }}>
            {ok}.
          </div>
        ) : null}

        <div className="search" style={{ marginBottom: 12 }}>
          <input
            className="input search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraga (naziv, kategorija, issuer, veštine)."
            disabled={loading}
          />
          <Button variant="ghost" type="button" onClick={() => setQ("")} disabled={loading || !q}>
            Reset
          </Button>
        </div>

        <Table columns={columns} rows={filtered} actions={actions} />
      </Card>

      <Modal
        open={open}
        title={mode === "create" ? "Novi kredencijal" : `Izmena kredencijala #${selected?.id ?? ""}`}
        onClose={closeModal}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>
              Otkaži
            </Button>
            <Button variant="primary" type="button" onClick={save} disabled={saving}>
              {saving ? "Čuvam..." : "Sačuvaj"}
            </Button>
          </div>
        }
      >
        <div className="form">
          <div className="field">
            <div className="label">Naziv</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="npr. AWS Practitioner" disabled={saving} />
          </div>

          <div className="field">
            <div className="label">Kategorija</div>
            <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="npr. Cloud" disabled={saving} />
            <div className="helper">Kategorija je opciona.</div>
          </div>

          <div className="field">
            <div className="label">Issuer</div>
            <select className="select" value={issuerId} onChange={(e) => setIssuerId(e.target.value)} disabled={saving}>
              <option value="">-- Izaberi issuer --</option>
              {issuers.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <div className="helper">Issuer je obavezan.</div>
          </div>

          <div className="field">
            <div className="label">Validnost (meseci)</div>
            <input
              className="input"
              type="number"
              min={1}
              max={120}
              value={validityMonths}
              onChange={(e) => setValidityMonths(e.target.value)}
              placeholder="npr. 24"
              disabled={saving}
            />
            <div className="helper">Opciono. Min 1, max 120.</div>
          </div>

          <div className="field">
            <div className="label">Aktivan</div>
            <select className="select" value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")} disabled={saving}>
              <option value="1">Da</option>
              <option value="0">Ne</option>
            </select>
          </div>

          <div className="field">
            <div className="label">Skill 1</div>
            <select className="select" value={skill1Id} onChange={(e) => setSkill1Id(e.target.value)} disabled={saving}>
              <option value="">-- Obavezno --</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.category ? ` (${s.category})` : ""}
                </option>
              ))}
            </select>
            <div className="helper">Obavezno. Minimum 1 veština.</div>
          </div>

          <div className="field">
            <div className="label">Skill 2</div>
            <select className="select" value={skill2Id} onChange={(e) => setSkill2Id(e.target.value)} disabled={saving}>
              <option value="">-- Opciono --</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.category ? ` (${s.category})` : ""}
                </option>
              ))}
            </select>
            <div className="helper">Opciono. Maksimalno 2 veštine ukupno.</div>
          </div>

          {saveErr ? (
            <div className="helper" style={{ color: "var(--c-danger)" }}>
              {saveErr}.
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
