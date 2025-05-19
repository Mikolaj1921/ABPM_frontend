import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // pobieranie danych użytkownika z backendu
  const fetchUser = async (token) => {
    try {
      console.log(`Fetching user with token: ${token.substring(0, 10)}...`);
      const response = await API.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(
        'Fetch user response:',
        JSON.stringify(response.data, null, 2),
      );
      const fetchedUser = {
        id: response.data.user.id,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
        email: response.data.user.email,
      };
      setUser(fetchedUser);
      return { success: true, user: fetchedUser };
    } catch (error) {
      console.error('Error fetching user:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        fullError: error.toString(),
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data',
      };
    }
  };

  // sprawdzanie tokenu przy starcie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(
          'Stored token at startup:',
          token ? `${token.substring(0, 10)}...` : 'No token',
        );
        if (token) {
          setIsLoggedIn(true);
          const result = await fetchUser(token);
          if (!result.success) {
            console.log('Initial fetch user failed:', result.message);
            // nie czyścimy usera, aby zachować dane z login
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // func logowania
  const login = async (email, password) => {
    try {
      console.log('Logging in with email:', email);
      const response = await API.post('/auth/login', { email, password });
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      const { token, user: loggedInUser } = response.data;
      console.log('Token:', `${token.substring(0, 10)}...`);
      await AsyncStorage.setItem('token', token);
      console.log(
        'Saved token:',
        `${(await AsyncStorage.getItem('token')).substring(0, 10)}...`,
      );
      // ustal dane użytkownika z odpowiedzi /auth/login
      const fallbackUser = {
        id: loggedInUser.id,
        firstName: loggedInUser.first_name,
        lastName: loggedInUser.last_name,
        email: loggedInUser.email,
      };
      console.log('Setting user:', JSON.stringify(fallbackUser, null, 2));
      setUser(fallbackUser);
      setIsLoggedIn(true);
      console.log('Użytkownik został poprawnie zalogowany');
      // Próbujemy pobrać dane z /auth/me
      const fetchResult = await fetchUser(token);
      if (!fetchResult.success) {
        console.log(
          'Fetch user after login failed, keeping fallback user data',
        );
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Network error',
      };
    }
  };

  // Funkcja wylogowania
  const logout = async () => {
    try {
      console.log('Logging out');
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // func do ponownego pobierania danych użytkownika
  const retryFetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(
        'Retry fetch user with token:',
        token ? `${token.substring(0, 10)}...` : 'No token',
      );
      if (token) {
        const result = await fetchUser(token);
        return result;
      }
      return { success: false, message: 'No token available' };
    } catch (error) {
      console.error('Retry fetch user error:', {
        message: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data',
      };
    }
  };

  const contextValue = React.useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      loading,
      login,
      logout,
      retryFetchUser,
    }),
    [isLoggedIn, user, loading],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
