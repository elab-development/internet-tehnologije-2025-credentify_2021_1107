import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";

function extractError(e, fallback) {
  const data = e?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return data?.message || fallback;
}

export default function Profile({ user, setUser }) {
  const [me, setMe] = useState(user || null);

  const [profileInfo, setProfileInfo] = useState(user?.profile_info || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");


  function persistUser(nextUser) {
    setMe(nextUser);
    setUser?.(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser || null));
  }

  async function fetchMe() {
    setErr("");
    setOk("");
    setLoading(true);

    try {
      // baseURL je već podešen u App.js (axios.defaults.baseURL = .../api).
      const res = await axios.get("/me");
      const u = res.data?.data?.user || null;

      persistUser(u);
      setProfileInfo(u?.profile_info || "");
    } catch (e) {
      setErr(extractError(e, "Greška pri učitavanju profila"));
    } finally {
      setLoading(false);
    }
  }

  //cuvanje izmene statusa
  async function save(e) {
    e?.preventDefault?.();

    setErr("");
    setOk("");
    setSaving(true);

    try {
      const payload = {
        profile_info: profileInfo?.trim() ? profileInfo : null,
      };

      const res = await axios.put("/me/profile-info", payload);
      const u = res.data?.data?.user || null;

      persistUser(u);
      setProfileInfo(u?.profile_info || "");
      setOk("Profil je uspešno ažuriran");
    } catch (e) {
      setErr(extractError(e, "Ažuriranje nije uspelo"));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Card
      title="Moj profil"
      subtitle="Pregled profila i ažuriranje sekcije „O meni“."
      actions={
        <Button variant="secondary" type="button" onClick={fetchMe} disabled={loading || saving}>
          {loading ? "Učitavam..." : "Osveži"}
        </Button>
      }
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

      <div className="profile" style={{ marginBottom: 18 }}>

        <div className="kv">
          <div className="kv-row">
            <div className="kv-key">Ime</div>
            <div className="kv-val">{me?.name || "-"}</div>
          </div>

          <div className="kv-row">
            <div className="kv-key">Email</div>
            <div className="kv-val">{me?.email || "-"}</div>
          </div>

          <div className="kv-row">
            <div className="kv-key">Uloga</div>
            <div className="kv-val">{me?.role || "-"}</div>
          </div>
        </div>
      </div>

      <form className="form" onSubmit={save}>
        <div className="field">
          <div className="label">O meni</div>

          <textarea
            className="textarea"
            value={profileInfo}
            onChange={(e) => setProfileInfo(e.target.value)}
            placeholder="Napiši kratko o sebi (do 1000 karaktera)."
            maxLength={1000}
            disabled={loading || saving}
          />

          <div className="helper">
            {profileInfo?.length || 0}/1000.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="secondary" type="button" onClick={() => setProfileInfo(me?.profile_info || "")} disabled={loading || saving}>
            Resetuj
          </Button>

          <Button variant="primary" type="submit" disabled={loading || saving}>
            {saving ? "Čuvam..." : "Sačuvaj"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
