import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { userAPI } from '../services/api.js';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
          const response = await userAPI.getProfile();
          const { name, tokens } = response.data;
          
          // Atualizar tokens caso tenham sido renovados
          if (tokens?.accessToken && tokens?.refreshToken) {
            setAccessToken(tokens.accessToken);
            setRefreshToken(tokens.refreshToken);
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
          }
          
          // Extrair email do localStorage ou usar apenas o name
          const storedEmail = localStorage.getItem('userEmail') || '';
          setUser({ name, email: storedEmail });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Se o token for inválido, limpar storage
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login`, {
        email,
        password
      });
      
      const { name, tokens } = response.data;
      
      if (!tokens || !tokens.accessToken) {
        throw new Error('Resposta da API inválida: tokens não encontrados');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = tokens;
      
      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser({ name, email });
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('userEmail', email);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro ao fazer login';
      
      return { 
        success: false, 
        message: errorMessage
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
      
      const { name: userName, tokens } = response.data;
      
      if (!tokens || !tokens.accessToken) {
        throw new Error('Resposta da API inválida: tokens não encontrados');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = tokens;
      
      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser({ name: userName || name, email });
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('userEmail', email);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro ao criar conta';
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
