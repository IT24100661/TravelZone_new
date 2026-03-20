import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { clearAuth, getAuth, saveAuth } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getAuth());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getAuth();
    if (stored) setUser(stored);
  }, []);

  const login = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", formData);
      saveAuth(res.data);
      setUser(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", formData);
      saveAuth(res.data);
      setUser(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user?.token,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
