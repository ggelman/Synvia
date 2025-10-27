import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';
import api from '../services/api'; 

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userData = localStorage.getItem("user");

    if (accessToken && refreshToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        logout(); 
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, senha, otp) => {
    try {
      const response = await api.post('/auth/login', { email, senha, otp }, {
        validateStatus: (status) => status < 500,
      });

      if (response.status === 200) {
        const { accessToken, refreshToken, user } = response.data;
        if (accessToken && refreshToken && user) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          return { success: true, user };
        }
      }

      if (response.status === 202) {
        return { mfaRequired: true };
      }

      if (response.status === 428) {
        return {
          mfaSetupRequired: true,
          secret: response.data?.secret,
          otpauthUrl: response.data?.otpauthUrl,
          user: response.data?.user,
        };
      }

      return { error: response.data?.error || 'Credenciais inválidas' };
    } catch (error) {
      console.error("Erro no login:", error.response?.data || error.message);
      logout();
      return { error: 'Erro ao efetuar login' };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (accessToken && newRefreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return true;
      }
      
      logout();
      return false;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      logout();
      return false;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      refreshAccessToken,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user],
  )

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#B8860B",
        }}
      >
        Carregando...
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};