import React, { createContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../authUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkToken();
  }, []);

  const logout = async () => {
    await removeToken();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
