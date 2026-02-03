import React from "react";
import Card from "../components/Card";

export default function Home({ user }) {
  return (
    <Card
      title="Home"
      subtitle="Zajednička komponenta, menja se samo ime i uloga."
      actions={<span className="badge badge-neutral">{user?.role || "guest"}</span>}
    >
      <p className="p">
        Zdravo, <span style={{ fontWeight: 800 }}>{user?.name || "gost"}.</span>
      </p>
    </Card>
  );
}
