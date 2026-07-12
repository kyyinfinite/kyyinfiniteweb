import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth, googleProvider, githubProvider } from '../firebase.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (nextUser) {
        const token = await nextUser.getIdToken();
        setUser(nextUser);
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function loginWithGoogle() {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    await signInWithPopup(firebaseAuth, googleProvider);
  }

  async function loginWithGithub() {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    await signInWithPopup(firebaseAuth, githubProvider);
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

  const value = { user, idToken, isLoading, loginWithGoogle, loginWithGithub, logout, refreshToken };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
