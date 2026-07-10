import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAdminUser(user);
        setIdToken(token);
      } else {
        setAdminUser(null);
        setIdToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email, password) {
    if (!firebaseAuth) {
      throw new Error('Firebase is not configured. Check your VITE_FIREBASE_* environment variables.');
    }
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function logout() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  }

  async function refreshToken() {
    if (firebaseAuth && firebaseAuth.currentUser) {
      const token = await firebaseAuth.currentUser.getIdToken(true);
      setIdToken(token);
      return token;
    }
    return null;
  }

  const value = { adminUser, idToken, isLoading, login, logout, refreshToken };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
