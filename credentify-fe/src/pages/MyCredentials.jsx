import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";

function StatusBadge({ status }) {
  const tone =
    status === "Approved"
      ? "badge-success"
      : status === "Pending"
      ? "badge-warning"
      : status === "Rejected"
      ? "badge-danger"
      : "badge-neutral";

  return <span className={`badge ${tone}`}>{status}</span>;
}

export default function MyCredentials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchMy() {
    setErr("");
    setLoading(true);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";

      // promeni rutu ako ti se drugačije zove
      const res = await axios.get("/me/credentials");

      // očekujem: data: { user_credentials: [...] }
      const list = res.data?.data?.user_credentials || [];
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju kredencijala");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMy();
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "credential",
        header: "Kredencijal",
        render: (uc) => {
          const c = uc.credential;
          const issuerName = c?.issuer?.name || c?.issuer_name || "-";

          return (
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 900, color: "var(--c-graphite)" }}>
                {c?.name || "-"}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c?.category ? <span className="badge badge-neutral">{c.category}</span> : null}
                {issuerName !== "-" ? <span className="badge badge-neutral">{issuerName}</span> : null}
                {c?.validity_months ? (
                  <span className="badge badge-neutral">{c.validity_months} mes</span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (uc) => <StatusBadge status={uc.status} />,
      },
      {
        key: "applied_date",
        header: "Applied",
        render: (uc) => uc.applied_date || "-",
      },
      {
        key: "issued_date",
        header: "Issued",
        render: (uc) => uc.issued_date || "-",
      },
      {
        key: "expiry_date",
        header: "Expiry",
        render: (uc) => uc.expiry_date || "-",
      },
      {
        key: "image",
        header: "Slika",
        render: (uc) => {
          const url = uc.image;

          if (!url) return "-";

          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
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

              <a className="p" href={url} target="_blank" rel="noreferrer">
                Otvori
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <Card
      title="Moji kredencijali"
      subtitle="Pregled prijava, statusa i slika sertifikata"
      actions={
        <Button variant="secondary" type="button" onClick={fetchMy} disabled={loading}>
          {loading ? "Učitavam..." : "Osveži"}
        </Button>
      }
    >
      {err ? (
        <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
          {err}.
        </div>
      ) : null}

      <Table columns={columns} rows={rows} />
    </Card>
  );
}
