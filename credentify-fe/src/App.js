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

axios.defaults.baseURL = "http://127.0.0.1:8000/api";

function setAuthHeader(token) {
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axios.defaults.headers.common["Authorization"];
}

function Guard({ allow, children }) {
  return allow ? children : <Navigate to="/home" replace />;
}

function AppShell() {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isAuthed = !!token && !!user;
  const role = user?.role || "guest";

  useEffect(() => {
    setAuthHeader(token);
  }, [token]);

  function persistAuth(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setAuthHeader(newToken);
  }

  async function handleLogout() {
    try {
      await axios.post("/logout");
    } catch {}
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthHeader("");
    navigate("/login");
  }

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
