import React, { createContext, useEffect, useState } from "react";
import API from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Fetch logged-in user
    API.get("/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    // Fetch logged-in admin
    API.get("/admin/me", { withCredentials: true })
      .then((res) => setAdmin(res.data))
      .catch(() => setAdmin(null))
      .finally(() => setLoadingAuth(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, admin, setAdmin, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
