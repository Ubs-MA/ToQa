import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("toqa_token")) return setLoading(false);
    api("/auth/me").then(setUser).catch(() => localStorage.removeItem("toqa_token")).finally(() => setLoading(false));
  }, []);
  const authenticate = async (mode, values) => {
    const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(values) });
    localStorage.setItem("toqa_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("toqa_token");
    setUser(null);
  };
  const value = useMemo(() => ({ user, setUser, loading, login: (v) => authenticate("login", v), register: (v) => authenticate("register", v), logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
