// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { register, login as loginAPI, logout as logoutAPI, getUser, updateProfile as updateProfileAPI, changePassword as changePasswordAPI } from '../api/Auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  const getRoleNames = (userData) => {
    if (!userData) return [];
    const roles = [];

    if (Array.isArray(userData.roles)) {
      userData.roles.forEach((roleItem) => {
        if (typeof roleItem === 'string') {
          roles.push(roleItem.toLowerCase());
        } else if (roleItem?.name) {
          roles.push(roleItem.name.toLowerCase());
        }
      });
    }

    if (typeof userData.role === 'string') {
      roles.push(userData.role.toLowerCase());
    }

    return [...new Set(roles)];
  };

  const normalizeUser = (userData) => {
    if (!userData) return null;
    const roleNames = getRoleNames(userData);

    const primaryRole = roleNames.includes('admin')
      ? 'admin'
      : roleNames.includes('doctor')
      ? 'doctor'
      : roleNames.includes('clinician')
      ? 'clinician'
      : roleNames.includes('patient')
      ? 'patient'
      : roleNames[0] || null;

    return {
      ...userData,
      role: primaryRole,
      roles: Array.isArray(userData.roles) ? userData.roles : [],
    };
  };

  const checkAuth = async () => {
    if (user && user.role) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    try {
      const response = await getUser();
      const userData = response.data.data?.user || response.data.data || response.data.user || response.data;
      const normalizedUser = normalizeUser(userData);

      if (!normalizedUser || !normalizedUser.role) {
        setUser(null);
      } else {
        setUser(normalizedUser);
      }
    } catch (error) {
      const status = error?.response?.status;
      const isUnauthorized = status === 401;

      if (!isUnauthorized) {
        console.error('❌ Auth check transient failure:', status || error?.code || error?.message);
      }

      if (isUnauthorized) {
        setUser(null);
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const signup = async (formData) => {
    try {
      const response = await register(formData);
      return { success: true, data: response.data };
    } catch (error) {
      let errorMessage = 'Registration failed';

      if (error.response) {
        const { data, status } = error.response;

        if (data && typeof data === 'object') {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            errorMessage = errorMessages.join(', ');
          } else {
            errorMessage = JSON.stringify(data);
          }
        } else if (data) {
          errorMessage = String(data);
        }

        errorMessage = `Status ${status}: ${errorMessage}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      throw new Error(errorMessage);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await loginAPI(credentials);

      const userData = response.data.data?.user || response.data.data || response.data.user || response.data;
      const normalizedUser = normalizeUser(userData);

      setUser(normalizedUser);
      setAuthChecked(true);

      return { success: true, data: normalizedUser };
    } catch (error) {
      console.error('❌ AUTH: Login error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (payload) => {
    try {
      const response = await updateProfileAPI(payload);
      const userData = response.data.data?.user || response.data.user || response.data;
      const normalizedUser = normalizeUser(userData);
      if (normalizedUser) setUser(normalizedUser);
      return response;
    } catch (error) {
      console.error('Profile update failed:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      throw new Error(message);
    }
  };

  const changePassword = async (payload) => {
    try {
      const response = await changePasswordAPI(payload);
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      throw new Error(message);
    }
  };

  const userRoles = getRoleNames(user);

  const value = {
    user,
    login,
    signup,
    logout,
    checkAuth,
    loading,
    updateProfile,
    changePassword,
    isPatient: user?.role === 'patient' || userRoles.includes('patient'),
    isClinician: user?.role === 'clinician' || userRoles.includes('clinician'),
    isAdmin: user?.role === 'admin' || userRoles.includes('admin'),
    isDoctor: user?.role === 'doctor' || userRoles.includes('doctor'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;