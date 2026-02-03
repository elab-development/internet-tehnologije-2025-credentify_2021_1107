import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Form from "../components/Form";
import Button from "../components/Button";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  //na pocetku false nista se ne ucitava
  const [loading, setLoading] = useState(false);

  function extractBackendErrors(e) {
    const data = e?.response?.data;

    if (data?.errors) {
      // Laravel validator errors: { field: ["msg1", "msg2"] }
      return Object.values(data.errors).flat().join(" ");
    }

    return data?.message || "Registracija nije uspela.";
  }

  //fja za registraciju
  async function submit() {
    setError("");
    //krece izvrsavanje pa je loading true
    setLoading(true);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";

      //saljemo axiosu podatke
      await axios.post("/register", {
        name,
        email,
        password,
      });

      // Backend ne vraća token — vodi korisnika na login
      navigate("/login");
    } catch (e) {
      setError(extractBackendErrors(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Card title="Register" subtitle="Kreiraj nalog.">
        <Form
          onSubmit={submit}
          actions={
            <>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPassword("");
                  setError("");
                }}
                disabled={loading}
              >
                Reset
              </Button>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
            </>
          }
        >
          <Form.Field label="Ime i prezime">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesi ime."
              autoComplete="name"
            />
          </Form.Field>

          <Form.Field label="Email">
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@primer.com"
              autoComplete="email"
            />
          </Form.Field>

          <Form.Field label="Password" helper="Minimum 6 karaktera.">
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lozinka"
              autoComplete="new-password"
            />
          </Form.Field>

          {error ? (
            <div className="helper" style={{ color: "var(--c-danger)" }}>
              {error}.
            </div>
          ) : null}
        </Form>
      </Card>

      <div className="card auth-image">
        <img src="/credentify.jpg" alt="Credentify" />
      </div>
    </div>
  );
}
