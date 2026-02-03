import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Form from "../components/Form";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

// Axios instance za backend (sa baseURL)
const api = axios.create({
  baseURL: API_BASE,
});

//izgled statusa koje boje ce biti
function StatusBadge({ status }) {
  const s = status || "Pending";
  const tone =
    s === "Approved"
      ? "badge-success"
      : s === "Pending"
      ? "badge-warning"
      : s === "Rejected"
      ? "badge-danger"
      : "badge-neutral";

  return <span className={`badge ${tone}`}>{s}</span>;
}

//da se izvuce greska ako je dobijemo
function extractError(e, fallback) {
  const data = e?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return data?.message || fallback;
}

// token header samo za backend
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

//fja za upload na javni servis
// Kada je status Approved, slika se (opciono) uploaduje na imgbb.
// Backend čuva samo URL slike (ne čuvamo fajl u bazi).
async function uploadToImgbb(file) {
  const key = process.env.REACT_APP_IMGBB_KEY;
  if (!key) throw new Error("Nedostaje REACT_APP_IMGBB_KEY u .env.local");

  const form = new FormData();
  form.append("image", file);

  const url = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || "imgbb upload nije uspeo";
    throw new Error(msg);
  }

  const link = data?.data?.url || data?.data?.display_url;
  if (!link) throw new Error("imgbb nije vratio link slike.");
  return link;
}


export default function ModUserCredentials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filter samo po statusu
  const [status, setStatus] = useState(""); // "" = svi

  // modal
  const [selected, setSelected] = useState(null); // trenutno izabrana prijava (red iz tabele)
  const [newStatus, setNewStatus] = useState("Pending");

  // slika samo za Approved
  const [imageMode, setImageMode] = useState("upload"); // upload ili url
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  //vracanje liste svih korisnickih kredencijala
  async function fetchList(nextStatus) {
    setErr("");
    setLoading(true);

    try {
      //u slucaju da imamo filter po statusu
      const s = typeof nextStatus === "string" ? nextStatus : status;

      //taj filter stavljamo u params
      const params = {};
      if (s) params.status = s;

      const res = await api.get("/moderator/user-credentials", {
        params,
        headers: getAuthHeaders(),
      });

      const list = res.data?.data?.user_credentials || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractError(e, "Greška pri učitavanju prijava"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList("");
  }, []);

  //otvaranje modala
  function openUpdateModal(row) {
    setSelected(row);
    setSaveErr("");

    setNewStatus(row?.status || "Pending");
    setImageMode("upload");
    setImageUrl(row?.image || "");
    setImageFile(null);
  }

  //zatvaranje modala
  function closeUpdateModal() {
    if (saving) return;
    setSelected(null);
    setSaveErr("");
    setNewStatus("Pending");
    setImageMode("upload");
    setImageUrl("");
    setImageFile(null);
  }

  //azuriranje kredencijala
  async function saveUpdate() {
    if (!selected) return;

    setSaveErr("");
    setSaving(true);

    try {
      const payload = { status: newStatus };

      if (newStatus === "Approved") {
        let finalUrl = "";

        //u slucaju da se uploaduje i slika povlacimo url
        if (imageMode === "upload") {
          if (!imageFile) {
            // dozvoli odobravanje i bez slike, ali bez pokušaja upload-a
            finalUrl = "";
          } else {
            finalUrl = await uploadToImgbb(imageFile);
          }
        }

        if (imageMode === "url") {
          finalUrl = (imageUrl || "").trim();
        }

        if (finalUrl) payload.image = finalUrl;
      }

      //fja sa backenda
      await api.patch(`/moderator/user-credentials/${selected.id}`, payload, {
        headers: getAuthHeaders(),
      });

      await fetchList(); // refetch sa trenutnim status filterom
      closeUpdateModal(); //kad se zavrsi zatvara se modal
    } catch (e) {
      setSaveErr(extractError(e, "Ažuriranje nije uspelo"));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "user",
        header: "Korisnik",
        render: (r) => (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 900, color: "var(--c-graphite)" }}>{r.user?.name || "-"}</div>
          </div>
        ),
      },
      {
        key: "credential",
        header: "Kredencijal",
        render: (r) => {
          const c = r.credential;
          const issuer = c?.issuer?.name || "-";
          return (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900, color: "var(--c-graphite)" }}>{c?.name || "-"}</div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c?.category ? <span className="badge badge-neutral">{c.category}</span> : null}
                <span className="badge badge-neutral">{issuer}</span>
                {c?.validity_months ? <span className="badge badge-neutral">{c.validity_months} mes</span> : null}
              </div>

              {Array.isArray(c?.skills) && c.skills.length ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.skills.slice(0, 3).map((s) => (
                    <span key={s.id || s.name} className="tag">
                      {s.name}
                    </span>
                  ))}
                  {c.skills.length > 3 ? <span className="tag">+{c.skills.length - 3}</span> : null}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (r) => <StatusBadge status={r.status} />,
      },
      { key: "applied_date", header: "Applied", render: (r) => r.applied_date || "-" },
      { key: "issued_date", header: "Issued", render: (r) => r.issued_date || "-" },
      { key: "expiry_date", header: "Expiry", render: (r) => r.expiry_date || "-" },
      {
        key: "image",
        header: "Slika",
        render: (r) => {
          if (!r.image) return "-";
          return (
            <a href={r.image} target="_blank" rel="noreferrer">
              <img
                src={r.image}
                alt="credential"
                style={{
                  width: 60,
                  height: 38,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid var(--c-border)",
                  boxShadow: "var(--shadow-sm)",
                  display: "block",
                }}
              />
            </a>
          );
        },
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Ažuriraj",
        variant: "primary",
        onClick: openUpdateModal,
      },
    ],
    []
  );

  return (
    <>
      <Card
        title="Users & Credentials"
        subtitle="Moderator pregled prijava i promena statusa."
        actions={
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 200 }}
              disabled={loading}
            >
              <option value="">Status (svi)</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>

            <Button
              variant="secondary"
              type="button"
              onClick={() => fetchList()}
              disabled={loading}
            >
              {loading ? "Učitavam..." : "Primeni"}
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setStatus("");
                fetchList("");
              }}
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        }
      >
        {err ? (
          <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
            {err}.
          </div>
        ) : null}

        <Table columns={columns} rows={rows} actions={actions} />
      </Card>

      <Modal
        open={!!selected}
        title={selected ? `Ažuriranje prijave #${selected.id}` : ""}
        onClose={closeUpdateModal}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={closeUpdateModal} disabled={saving}>
              Otkaži
            </Button>
            <Button variant="primary" type="button" onClick={saveUpdate} disabled={saving}>
              {saving ? "Čuvam..." : "Sačuvaj"}
            </Button>
          </div>
        }
      >
        {selected ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div className="p" style={{ margin: 0 }}>
              Korisnik: <b>{selected.user?.name || "-"}</b> ({selected.user?.email || "-"})
            </div>

            <div className="p" style={{ margin: 0 }}>
              Kredencijal: <b>{selected.credential?.name || "-"}</b>
            </div>

            <Form onSubmit={saveUpdate}>
              <Form.Field label="Status">
                <select
                  className="input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={saving}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </Form.Field>

              {newStatus === "Approved" ? (
                <>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button
                      variant={imageMode === "upload" ? "primary" : "secondary"}
                      type="button"
                      onClick={() => setImageMode("upload")}
                      disabled={saving}
                    >
                      Upload
                    </Button>
                    <Button
                      variant={imageMode === "url" ? "primary" : "secondary"}
                      type="button"
                      onClick={() => setImageMode("url")}
                      disabled={saving}
                    >
                      URL
                    </Button>
                  </div>

                  {imageMode === "upload" ? (
                    <Form.Field label="Slika (upload na imgbb)">
                      <input
                        className="input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        disabled={saving}
                      />
                      <div className="helper">
                        Može i bez slike. Ako izabereš fajl, uploaduje se na imgbb i čuva kao link.
                      </div>
                    </Form.Field>
                  ) : (
                    <Form.Field label="Slika (URL)">
                      <input
                        className="input"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        disabled={saving}
                      />
                      <div className="helper">Uneti link će se sačuvati u bazi.</div>
                    </Form.Field>
                  )}
                </>
              ) : null}

              {saveErr ? (
                <div className="helper" style={{ color: "var(--c-danger)" }}>
                  {saveErr}.
                </div>
              ) : null}
            </Form>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
