import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('moreleaf_token');
      const storedUser = localStorage.getItem('moreleaf_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const res = await authService.getProfile();
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('moreleaf_token');
          localStorage.removeItem('moreleaf_user');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (userData) => {
    const { token, ...rest } = userData;
    localStorage.setItem('moreleaf_token', token);
    localStorage.setItem('moreleaf_user', JSON.stringify(rest));
    setUser(rest);
  };

  const logout = () => {
    localStorage.removeItem('moreleaf_token');
    localStorage.removeItem('moreleaf_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('moreleaf_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
