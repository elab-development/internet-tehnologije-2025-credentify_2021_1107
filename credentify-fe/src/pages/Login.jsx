import React, { useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Form from "../components/Form";
import Button from "../components/Button";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("nikola@credentify.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //metoda za login, async salje se zahtev serveru i zove nasa ruta
  async function submit() {
    //eror prazan na pocetku
    setError("");
    //krece izvrsavanje pa je loading true
    setLoading(true);

    try {
      axios.defaults.baseURL = "http://127.0.0.1:8000/api";
      //primamo odgovor od post metode
      const res = await axios.post("/login", { email, password });

      //setujemo podatke dobijene sa backenda
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      if (!token || !user) {
        setError("Neispravan odgovor servera.");
        return;
      }

      //prosledjujemo podatke app.js kompoenti
      onAuth(token, user);
    } catch (e) {
      setError(e?.response?.data?.message || "Login nije uspeo.");
    } finally {
      setLoading(false);
    }
  }

  //sta se prikazuje
  return (
    <div className="auth-wrap">
      <Card title="Login" subtitle="Prijavi se na platformu.">
        <Form
          onSubmit={submit}
          actions={
            <>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  setError("");
                }}
                disabled={loading}
              >
                Reset
              </Button>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </>
          }
        >
          <Form.Field label="Email">
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@primer.com"
              autoComplete="email"
            />
          </Form.Field>

          <Form.Field label="Password">
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lozinka"
              autoComplete="current-password"
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
