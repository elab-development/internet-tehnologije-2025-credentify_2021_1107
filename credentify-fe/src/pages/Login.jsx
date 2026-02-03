import React, { useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Form from "../components/Form";
import Button from "../components/Button";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("admin@credentify.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      const res = await axios.post("/login", { email, password });
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;

      if (!token || !user) {
        setError("Neispravan odgovor servera.");
        return;
      }

      onAuth(token, user);
    } catch (e) {
      setError(e?.response?.data?.message || "Login nije uspeo.");
    }
  }

  return (
    <Card title="Login" subtitle="Prijavi se na platformu.">
      <Form
        onSubmit={submit}
        actions={
          <>
            <Button variant="secondary" type="button" onClick={() => { setEmail(""); setPassword(""); }}>
              Reset
            </Button>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </>
        }
      >
        <Form.Field label="Email">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Field>

        <Form.Field label="Password">
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Field>

        {error ? <div className="helper" style={{ color: "var(--c-danger)" }}>{error}.</div> : null}
      </Form>
    </Card>
  );
}
