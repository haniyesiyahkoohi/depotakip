import { createContext, useContext, useState } from "react";
import { api, API_ROOT } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("depotakip_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("depotakip_username"));

  // Uygulama ilk açıldığında, kayıtlı token varsa axios'a otomatik ekle
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  }

  async function login(user, password) {
    const { data } = await api.post(
      "/api-token-auth/",
      { username: user, password },
      { baseURL: API_ROOT }
    );
    setToken(data.token);
    setUsername(user);
    localStorage.setItem("depotakip_token", data.token);
    localStorage.setItem("depotakip_username", user);
    api.defaults.headers.common["Authorization"] = `Token ${data.token}`;
  }

  function logout() {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("depotakip_token");
    localStorage.removeItem("depotakip_username");
    delete api.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider value={{ token, username, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
