import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:7000/api/auth/login", {
      email,
      password,
    });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await axios.post("http://localhost:7000/api/auth/register", {
      username,
      email,
      password,
    });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
