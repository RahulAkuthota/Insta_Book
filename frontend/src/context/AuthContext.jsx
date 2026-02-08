import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logoutUser } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 hydrate auth on refresh
  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const logout = async () => {
    setUser(null);
    try {
      await logoutUser();
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
