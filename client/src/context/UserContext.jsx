import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
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

  async function registerWithEmail(email, password) {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await sendEmailVerification(credential.user);
    return credential.user;
  }

  async function loginWithEmail(email, password) {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function resendVerificationEmail() {
    if (!firebaseAuth || !firebaseAuth.currentUser) {
      throw new Error('No signed-in user to verify.');
    }
    await sendEmailVerification(firebaseAuth.currentUser);
  }

  /** Siapin invisible reCAPTCHA di container tertentu — dipanggil sekali sebelum sendOtp. */
  function setupRecaptcha(containerId) {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    if (!window.__kyyRecaptchaVerifier) {
      window.__kyyRecaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, { size: 'invisible' });
    }
    return window.__kyyRecaptchaVerifier;
  }

  /** Kirim kode OTP ke nomor HP (format E.164, misal +6281234567890). */
  async function sendOtp(phoneNumber, containerId = 'recaptcha-container') {
    if (!firebaseAuth) throw new Error('Firebase is not configured.');
    const verifier = setupRecaptcha(containerId);
    return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
  }

  /** Konfirmasi kode OTP yang diketik user, dari confirmationResult hasil sendOtp(). */
  async function confirmOtp(confirmationResult, code) {
    await confirmationResult.confirm(code);
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

  const value = {
    user,
    idToken,
    isLoading,
    loginWithGoogle,
    loginWithGithub,
    registerWithEmail,
    loginWithEmail,
    resendVerificationEmail,
    sendOtp,
    confirmOtp,
    logout,
    refreshToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
