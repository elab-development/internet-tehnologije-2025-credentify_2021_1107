import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function AvailableCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyErr, setApplyErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  //dostupni kredencijali za korisnika - one koje nema
  async function fetchAvailable() {
    setErr("");
    setSuccessMsg("");
    setLoading(true);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";
      const res = await axios.get("/me/available-credentials");
      setCredentials(res.data?.data?.credentials || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju kredencijala");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAvailable();
  }, []);

  //naziv prijave za koji kredencijal
  const modalTitle = useMemo(() => {
    if (!selected) return "";
    return `Prijava: ${selected.name}`;
  }, [selected]);

  //prijava za izabrani kredencijal
  async function apply() {
    if (!selected) return;

    setApplyErr("");
    setApplyLoading(true);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";
      //samo id se salje kad se prijavljujemo
      await axios.post("/me/apply", { credential_id: selected.id });

      // ukloni iz liste (jer više nije dostupno)
      setCredentials((prev) => prev.filter((c) => c.id !== selected.id));

      setSelected(null);
      setSuccessMsg("Prijava je uspešno kreirana");
    } catch (e) {
      setApplyErr(
        e?.response?.data?.message ||
          (e?.response?.data?.errors
            ? Object.values(e.response.data.errors).flat().join(" ")
            : null) ||
          "Prijava nije uspela"
      );
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <>
      <Card
        title="Dostupni kredencijali"
        subtitle="Izaberi kredencijal i prijavi se"
        actions={
          <Button variant="secondary" type="button" onClick={fetchAvailable} disabled={loading}>
            {loading ? "Učitavam..." : "Osveži"}
          </Button>
        }
      >
        {err ? (
          <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
            {err}.
          </div>
        ) : null}

        {successMsg ? (
          <div className="helper" style={{ color: "var(--c-stormy-teal)", marginBottom: 10 }}>
            {successMsg}.
          </div>
        ) : null}

        <div className="creds-grid">
          {credentials.map((c) => {
            const issuerName = c.issuer?.name || "-";
            const skills = c.skills || [];

            return (
              <div className="card" key={c.id}>
                <div className="card-content">
                  <div style={{ fontWeight: 900, fontSize: 18, color: "var(--c-graphite)" }}>
                    {c.name}
                  </div>

                  <div className="cred-meta">
                    {c.category ? <span className="badge badge-neutral">{c.category}</span> : null}
                    <span className="badge badge-neutral">{issuerName}</span>
                    {c.validity_months ? (
                      <span className="badge badge-neutral">{c.validity_months} mes</span>
                    ) : null}
                  </div>

                  {skills.length ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {skills.slice(0, 4).map((s) => (
                        <span className="tag" key={s.id || s.name}>
                          {s.name}
                        </span>
                      ))}
                      {skills.length > 4 ? <span className="tag">+{skills.length - 4}</span> : null}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <Button variant="primary" type="button" onClick={() => setSelected(c)}>
                      Prijavi se
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setSelected(c)}>
                      Detalji
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && credentials.length === 0 ? (
          <div className="p" style={{ marginTop: 12 }}>
            Trenutno nema dostupnih kredencijala.
          </div>
        ) : null}
      </Card>

      <Modal
        open={!!selected}
        title={modalTitle}
        onClose={() => {
          if (!applyLoading) {
            setApplyErr("");
            setSelected(null);
          }
        }}
        footer={
          <div className="modal-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setApplyErr("");
                setSelected(null);
              }}
              disabled={applyLoading}
            >
              Otkaži
            </Button>

            <Button variant="primary" type="button" onClick={apply} disabled={applyLoading}>
              {applyLoading ? "Šaljem..." : "Potvrdi prijavu"}
            </Button>
          </div>
        }
      >
        {selected ? (
          <>
            <div className="p" style={{ marginBottom: 10 }}>
              Proveri detalje i potvrdi prijavu:
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div className="kv-row" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div className="kv-key">Issuer</div>
                <div className="kv-val">{selected.issuer?.name || "-"}</div>
              </div>

              <div className="kv-row" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div className="kv-key">Category</div>
                <div className="kv-val">{selected.category || "-"}</div>
              </div>

              <div className="kv-row" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div className="kv-key">Validnost</div>
                <div className="kv-val">{selected.validity_months ? `${selected.validity_months} mes` : "-"}</div>
              </div>

              {selected.skills?.length ? (
                <div>
                  <div className="label" style={{ marginBottom: 8 }}>
                    Veštine:
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selected.skills.map((s) => (
                      <span className="tag" key={s.id || s.name}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {applyErr ? (
                <div className="helper" style={{ color: "var(--c-danger)" }}>
                  {applyErr}.
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
