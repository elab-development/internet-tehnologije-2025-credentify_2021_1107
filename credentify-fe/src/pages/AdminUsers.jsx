import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  //vracanje korisnika iz baze
  async function fetchUsers() {
    setErr("");
    //krece fja, loading true
    setLoading(true);
    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";

      const res = await axios.get("/users");
      //ako postoje useri setuje se niz, ako ne onda je prazan niz
      setUsers(res.data?.data?.users || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri učitavanju korisnika");
    } finally {
      //kad je zavrseno loading false
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  //poziv fje sa backenda za brisanje
  async function handleDelete(row) {
    const ok = window.confirm("Da li sigurno želiš da obrišeš ovog korisnika?");
    if (!ok) return;

    setErr("");
    //id reda koji brisemo
    setDeletingId(row.id);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";
      await axios.delete(`/users/${row.id}`);

      //niz korisnika se refreshuje i izbacuje se onaj obrisani
      setUsers((prev) => prev.filter((u) => u.id !== row.id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Brisanje nije uspelo");
    } finally {
      //sad deleting id prazan nakon brisanja
      setDeletingId(null);
    }
  }

  //nazivi kolona koje prosledjujemo
  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "name",
        header: "Ime",
        render: (u) => <span style={{ fontWeight: 800, color: "var(--c-graphite)" }}>{u.name}</span>,
      },
      { key: "email", header: "Email" },
      {
        key: "role",
        header: "Uloga",
        render: (u) => <span className="badge badge-neutral">{u.role}</span>,
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: deletingId ? "Brišem..." : "Obriši",
        variant: "danger",
        onClick: handleDelete,
        disabled: (row) => deletingId === row.id,
        //da admin ne mze sam sebe da obrise
        show: (row) => row.role !== "admin",
      },
    ],
    [deletingId]
  );

  return (
    <Card
      title="Korisnici"
      subtitle="Pregled registrovanih korisnika i uklanjanje naloga"
      actions={
        <Button variant="secondary" type="button" onClick={fetchUsers} disabled={loading}>
          {loading ? "Učitavam..." : "Osveži"}
        </Button>
      }
    >
      {err ? (
        <div className="helper" style={{ color: "var(--c-danger)", marginBottom: 10 }}>
          {err}
        </div>
      ) : null}

      <Table columns={columns} rows={users} actions={actions} />
    </Card>
  );
}
