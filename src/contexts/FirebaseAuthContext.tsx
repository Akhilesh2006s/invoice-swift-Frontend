import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailLink, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  sendEmailLink: (email: string) => Promise<void>;
  signInWithEmailLink: (email: string, url: string) => Promise<void>;
  logout: () => Promise<void>;
  isMagicLink: (url: string) => boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendEmailLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/callback`,
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.yourapp.ios'
      },
      android: {
        packageName: 'com.yourapp.android',
        installApp: true,
        minimumVersion: '12'
      }
    };

    try {
      console.log('Sending magic link to:', email);
      console.log('Action code settings:', actionCodeSettings);
      console.log('Current origin:', window.location.origin);
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email for later use
      window.localStorage.setItem('emailForSignIn', email);
      console.log('Magic link sent successfully!');
    } catch (error) {
      console.error('Error sending magic link:', error);
      console.error('Error details:', error.code, error.message);
      throw error;
    }
  };

  const signInWithEmailLink = async (email: string, url: string) => {
    try {
      const result = await signInWithEmailLink(auth, email, url);
      // Clear the saved email
      window.localStorage.removeItem('emailForSignIn');
      return result;
    } catch (error) {
      console.error('Error signing in with magic link:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isMagicLink = (url: string) => {
    return isSignInWithEmailLink(auth, url);
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    sendEmailLink,
    signInWithEmailLink,
    logout,
    isMagicLink
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
