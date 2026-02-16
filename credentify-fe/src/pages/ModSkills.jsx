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

export default function ModSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create i edit
  const [selected, setSelected] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [ok, setOk] = useState("");

  //vracanje skilova sa backenda
  async function fetchSkills() {
    setErr("");
    setOk("");
    setLoading(true);

    try {
      const res = await axios.get("/skills");
      const list = res.data?.data?.skills || [];
      setSkills(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractError(e, "Greška pri učitavanju veština"));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkills();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return skills;

    return skills.filter((x) => {
      const a = (x?.name || "").toLowerCase();
      const b = (x?.category || "").toLowerCase();
      return a.includes(s) || b.includes(s);
    });
  }, [skills, q]);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setName("");
    setCategory("");
    setSaveErr("");
    setOk("");
    setOpen(true);
  }

  function openEdit(row) {
    setMode("edit");
    setSelected(row);
    setName(row?.name || "");
    setCategory(row?.category || "");
    setSaveErr("");
    setOk("");
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setSelected(null);
    setName("");
    setCategory("");
    setSaveErr("");
  }

  async function save() {
    setSaveErr("");
    setOk("");
    setSaving(true);

    try {
      const payload = {
        name: (name || "").trim(),
        category: (category || "").trim() ? category.trim() : null,
      };

      if (!payload.name) {
        setSaveErr("Naziv veštine je obavezan.");
        return;
      }

      if (mode === "create") {
        await axios.post("/skills", payload);
        setOk("Veština je uspešno kreirana.");
      } else {
        await axios.put(`/skills/${selected?.id}`, payload);
        setOk("Veština je uspešno izmenjena.");
      }

      await fetchSkills();
      closeModal();
    } catch (e) {
      setSaveErr(extractError(e, "Čuvanje nije uspelo"));
    } finally {
      setSaving(false);
    }
  }

  //brisanje skilova
  async function handleDelete(row) {
    const okConfirm = window.confirm("Da li sigurno želiš da obrišeš ovu veštinu?");
    if (!okConfirm) return;

    setErr("");
    setOk("");

    try {
      await axios.delete(`/skills/${row.id}`);
      setSkills((prev) => prev.filter((s) => s.id !== row.id));
      setOk("Veština je uspešno obrisana.");
    } catch (e) {
      setErr(extractError(e, "Brisanje nije uspelo"));
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "name",
        header: "Naziv",
        render: (s) => (
          <span style={{ fontWeight: 800, color: "var(--c-graphite)" }}>
            {s.name || "-"}
          </span>
        ),
      },
      {
        key: "category",
        header: "Kategorija",
        render: (s) => (s.category ? <span className="badge badge-neutral">{s.category}</span> : "-"),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      { label: "Izmeni", variant: "primary", onClick: openEdit },
      { label: "Obriši", variant: "danger", onClick: handleDelete },
    ],
    []
  );

  return (
    <>
      <Card
        title="Veštine"
        subtitle="Moderator pregled i upravljanje veštinama."
        actions={[
          <Button key="refresh" variant="secondary" type="button" onClick={fetchSkills} disabled={loading}>
            {loading ? "Učitavam..." : "Osveži"}
          </Button>,
          <Button key="add" variant="primary" type="button" onClick={openCreate} disabled={loading}>
            + Nova veština
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
            placeholder="Pretraga (naziv ili kategorija)."
            disabled={loading}
          />
          <Button
            variant="ghost"
            type="button"
            onClick={() => setQ("")}
            disabled={loading || !q}
          >
            Reset
          </Button>
        </div>

        <Table columns={columns} rows={filtered} actions={actions} />
      </Card>

      <Modal
        open={open}
        title={mode === "create" ? "Nova veština" : `Izmena veštine #${selected?.id ?? ""}`}
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
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. JavaScript"
              disabled={saving}
            />
          </div>

          <div className="field">
            <div className="label">Kategorija</div>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="npr. Frontend"
              disabled={saving}
            />
            <div className="helper">Kategorija je opciona.</div>
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
