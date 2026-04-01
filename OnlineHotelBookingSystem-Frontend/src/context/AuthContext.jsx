import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // On first load, read from localStorage so refresh works
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    if (userId && userRole) {
      return { userId, role: userRole, token };
    }
    return null;
  });

  const login = (userId, role, token) => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", role);
    localStorage.setItem("token", token);
    setUser({ userId, role, token });
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access anywhere
export const useAuth = () => useContext(AuthContext);