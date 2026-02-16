import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import { Chart } from "react-google-charts";

function readCssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function AdminMetrics() {
  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [theme, setTheme] = useState({
    graphite: "#353535",
    teal: "#3c6e71",
    white: "#ffffff",
    dust: "#d9d9d9",
    blue: "#284b63",
    bg: "#ffffff",
    text: "#353535",
  });

  useEffect(() => {
    setTheme({
      graphite: readCssVar("--c-graphite", "#353535"),
      teal: readCssVar("--c-stormy-teal", "#3c6e71"),
      white: readCssVar("--c-white", "#ffffff"),
      dust: readCssVar("--c-dust-grey", "#d9d9d9"),
      blue: readCssVar("--c-yale-blue", "#284b63"),
      bg: readCssVar("--c-bg", "#ffffff"),
      text: readCssVar("--c-text", "#353535"),
    });
  }, []);

  // Vraćanje metrika sa backenda.
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

  // Paleta boja za sve grafikone.
  const palette = useMemo(
    () => [theme.blue, theme.teal, theme.graphite, theme.dust],
    [theme]
  );

  const commonOptions = useMemo(
    () => ({
      backgroundColor: "transparent",
      chartArea: { left: 50, top: 20, right: 20, bottom: 50 },
      legend: { textStyle: { color: theme.text } },
      tooltip: { textStyle: { color: theme.text } },
    }),
    [theme]
  );

  const pieOptions = useMemo(
    () => ({
      ...commonOptions,
      colors: palette,
      pieHole: 0.35,
      pieSliceTextStyle: { color: theme.white },
    }),
    [commonOptions, palette, theme]
  );

  const columnOptions = useMemo(
    () => ({
      ...commonOptions,
      colors: [theme.teal],
      legend: { position: "none" },
      hAxis: { textStyle: { color: theme.text } },
      vAxis: { textStyle: { color: theme.text } },
    }),
    [commonOptions, theme]
  );

  const lineOptions = useMemo(
    () => ({
      ...commonOptions,
      colors: [theme.blue],
      legend: { position: "none" },
      hAxis: { textStyle: { color: theme.text } },
      vAxis: { textStyle: { color: theme.text } },
    }),
    [commonOptions, theme]
  );

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div className="tag">Korisnici: {m?.totals?.users ?? 0}.</div>
        <div className="tag">Kredencijali: {m?.totals?.credentials ?? 0}.</div>
        <div className="tag">Skill-ovi: {m?.totals?.skills ?? 0}.</div>
        <div className="tag">Prijave: {m?.totals?.applications ?? 0}.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Pie: korisnici po ulozi.</div>
          <Chart chartType="PieChart" width="100%" height="320px" data={usersByRoleData} options={pieOptions} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Pie: prijave po statusu.</div>
          <Chart chartType="PieChart" width="100%" height="320px" data={appsByStatusData} options={pieOptions} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Bar: top 5 kredencijala po broju prijava.</div>
          <Chart chartType="ColumnChart" width="100%" height="320px" data={topCredentialsData} options={columnOptions} />
        </div>

        <div>
          <div className="helper" style={{ marginBottom: 8 }}>Line: prijave po mesecima.</div>
          <Chart chartType="LineChart" width="100%" height="320px" data={byMonthData} options={lineOptions} />
        </div>
      </div>
    </Card>
  );
}
