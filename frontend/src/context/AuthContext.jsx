// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { decodeToken } from '../utils/tokenUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('🔍 Token from sessionStorage on page load:', token);
    
    if (token) {
      const decoded = decodeToken(token);
      console.log('🔍 Decoded token on page load:', decoded);
      console.log('🔍 User role from decoded token:', decoded?.role);
      
      if (decoded) {
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setAuth({ token, user: decoded });
          console.log('🔍 Auth state set successfully for role:', decoded.role);
        } else {
          console.log('❌ Token expired, removing from storage');
          sessionStorage.removeItem('token');
        }
      } else {
        console.log('❌ Failed to decode token');
        sessionStorage.removeItem('token'); // Clean up invalid token
      }
    } else {
      console.log('❌ No token found in sessionStorage');
    }
    
    setIsLoading(false); // Set loading to false after checking
  }, []);

  const login = (data) => {
    sessionStorage.setItem('token', data.token);
    const decoded = decodeToken(data.token);
    
    console.log('Login data received:', data); // Debug
    console.log('Frontend decoded on login:', decoded); // Debug
    
    setAuth({ token: data.token, user: decoded });
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setAuth(null);
    console.log('Logged out - token cleared'); // Debug
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};