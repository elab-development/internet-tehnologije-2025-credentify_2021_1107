import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import { Chart } from "react-google-charts";

export default function AdminMetrics() {
  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchMetrics() {
    setErr("");
    setLoading(true);
    try {
      const res = await axios.get("/admin/metrics");
      setM(res.data?.data || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju metrika");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  const usersByRoleData = useMemo(() => {
    const rows = (m?.usersByRole || []).map((x) => [x.role, Number(x.count)]);
    return [["Uloga", "Broj"], ...rows];
  }, [m]);

  const appsByStatusData = useMemo(() => {
    const rows = (m?.applicationsByStatus || []).map((x) => [x.status, Number(x.count)]);
    return [["Status", "Broj"], ...rows];
  }, [m]);

  const topCredentialsData = useMemo(() => {
    const rows = (m?.topCredentials || []).map((x) => [x.name, Number(x.count)]);
    return [["Kredencijal", "Prijave"], ...rows];
  }, [m]);

  const byMonthData = useMemo(() => {
    const rows = (m?.applicationsByMonth || []).map((x) => [x.month, Number(x.count)]);
    return [["Mesec", "Prijave"], ...rows];
  }, [m]);

  return (
    <Card
      title="Metrike"
      subtitle="Admin dashboard sa osnovnim statistikama i grafikonima."
      actions={
        <Button variant="secondary" type="button" onClick={fetchMetrics} disabled={loading}>
          {loading ? "Učitavam..." : "Osveži"}
        </Button>
      }
    >
      {err ? (
        <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
          {err}.
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div className="tag">Korisnici: {m?.totals?.users ?? 0}.</div>
        <div className="tag">Kredencijali: {m?.totals?.credentials ?? 0}.</div>
        <div className="tag">Skill-ovi: {m?.totals?.skills ?? 0}.</div>
        <div className="tag">Prijave: {m?.totals?.applications ?? 0}.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Pie: korisnici po ulozi.</div>
          <Chart chartType="PieChart" width="100%" height="320px" data={usersByRoleData} options={{ pieHole: 0.35 }} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Pie: prijave po statusu.</div>
          <Chart chartType="PieChart" width="100%" height="320px" data={appsByStatusData} options={{ pieHole: 0.35 }} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Bar: top 5 kredencijala po broju prijava.</div>
          <Chart chartType="ColumnChart" width="100%" height="320px" data={topCredentialsData} options={{ legend: { position: "none" } }} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Line: prijave po mesecima.</div>
          <Chart chartType="LineChart" width="100%" height="320px" data={byMonthData} options={{ legend: { position: "none" } }} />
        </div>
      </div>
    </Card>
  );
}
