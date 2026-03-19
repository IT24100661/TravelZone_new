import { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getStoredToken, getStoredUser, saveAuth } from "../utils/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const login = (authResponse) => {
    const loggedUser = {
      id: authResponse.id,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    };

    saveAuth(authResponse.token, loggedUser);
    setUser(loggedUser);
    setToken(authResponse.token);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
