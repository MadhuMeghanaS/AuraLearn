import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data || res.data.user);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    // Handle both { user, token } and { data: { user, token } } structures
    const data = res.data.data || res.data;
    const { token: newToken, user: userData } = data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password) => {
    // Backend expects 'username', but frontend form might use 'name'
    const res = await api.post('/auth/register', { username: name, email, password });
    const data = res.data.data || res.data;
    const { token: newToken, user: userData } = data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
