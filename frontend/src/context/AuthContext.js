import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(user?.role === "admin" || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/user/verify-token/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
          setIsAdmin(userData.role === "admin");
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyStoredToken();
  }, []);

  const login = async (userData, authToken) => {
    try {
      setToken(authToken);
      setUser(userData);
      setIsAdmin(userData.role === "admin");
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
