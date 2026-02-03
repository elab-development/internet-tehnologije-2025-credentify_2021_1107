import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyCredentials from "./pages/MyCredentials";
import AvailableCredentials from "./pages/AvailableCredentials";
import AdminUsers from "./pages/AdminUsers";
import ModSkills from "./pages/ModSkills";
import ModCredentials from "./pages/ModCredentials";
import ModUserCredentials from "./pages/ModUserCredentials";

// Jedinstveni baseURL za sve API pozive ka backend-u (Laravel API).
axios.defaults.baseURL = "http://127.0.0.1:8000/api";

// Dodaje/uklanja Bearer token u axios header-e (koristi se nakon login/logout).
function setAuthHeader(token) {
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axios.defaults.headers.common["Authorization"];
}

// zaštita ruta: ako uslov nije ispunjen, prebacuje na /login.
// allow tipično proverava da li je korisnik ulogovan + da li ima odgovarajuću ulogu.
function Guard({ allow, children }) {
  return allow ? children : <Navigate to="/login" replace />;
}

//okvir nase aplikacije
function AppShell() {
  const navigate = useNavigate();

  //Token i user se čuvaju u localStorage, da sesija preživi refresh.
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  //isAuthed = korisnik je ulogovan samo ako imamo i token i user objekat.
  const isAuthed = !!token && !!user;
  const role = user?.role || "guest";

  //Kad se token promeni (login/logout), ažuriramo axios Authorization header.
  useEffect(() => {
    setAuthHeader(token);
  }, [token]);

  //onAuth iz Login/Register šalje (token, user), mi to upisujemo u state i localStorage.
  function persistAuth(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken || "");
    localStorage.setItem("user", JSON.stringify(newUser || null));

    setAuthHeader(newToken);
  }

//Poziva backend logout (brisanje Sanctum tokena), zatim čisti localStorage i preusmerava na /login.
async function handleLogout() {
  try {
    await axios.post("/logout");
  } catch {}

  setToken("");
  setUser(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthHeader("");

  navigate("/login", { replace: true });
}

//sta se sve vraca koje rute, podela po ulogama
  return (
    <div className="app">
      <Sidebar isAuthed={isAuthed} role={role} onLogout={handleLogout} />

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthed ? "/home" : "/login"} replace />} />

            <Route path="/login" element={isAuthed ? <Navigate to="/home" replace /> : <Login onAuth={persistAuth} />} />
            <Route path="/register" element={isAuthed ? <Navigate to="/home" replace /> : <Register onAuth={persistAuth} />} />

            <Route path="/home" element={<Home user={user} />} />

            <Route
              path="/profile"
              element={
                <Guard allow={isAuthed && role === "user"}>
                  <Profile user={user} setUser={setUser} />
                </Guard>
              }
            />

            <Route
              path="/my-credentials"
              element={
                <Guard allow={isAuthed && role === "user"}>
                  <MyCredentials />
                </Guard>
              }
            />

            <Route
              path="/available-credentials"
              element={
                <Guard allow={isAuthed && role === "user"}>
                  <AvailableCredentials />
                </Guard>
              }
            />

            <Route
              path="/admin-users"
              element={
                <Guard allow={isAuthed && role === "admin"}>
                  <AdminUsers />
                </Guard>
              }
            />

            <Route
              path="/mod-skills"
              element={
                <Guard allow={isAuthed && role === "moderator"}>
                  <ModSkills />
                </Guard>
              }
            />

            <Route
              path="/mod-credentials"
              element={
                <Guard allow={isAuthed && role === "moderator"}>
                  <ModCredentials />
                </Guard>
              }
            />

            <Route
              path="/mod-user-credentials"
              element={
                <Guard allow={isAuthed && role === "moderator"}>
                  <ModUserCredentials />
                </Guard>
              }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
