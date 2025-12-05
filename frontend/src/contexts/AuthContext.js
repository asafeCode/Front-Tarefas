import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Configure axios defaults
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await axios.get(`${API_BASE}/api/user`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try to refresh token
          if (refreshToken) {
            await handleRefreshToken();
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleRefreshToken = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/token/refresh-token`, {
        refreshToken: refreshToken
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login`, {
        email,
        password
      });
      
      const { name, tokenses } = response.data;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokenses;
      
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser({ name, email });
      
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.errors?.[0] || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/user`, {
        name,
        email,
        password
      });
      
      const { tokenses } = response.data;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokenses;
      
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser({ name, email });
      
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.errors?.[0] || 'Erro ao criar conta' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};