import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import type { ReactNode } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('auth-user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        photoURL: firebaseUser.photoURL || undefined
      };
      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData));
    } catch (error: any) {
      setUser(null);
      localStorage.removeItem('auth-user');
      throw new Error('Credenciais inválidas ou usuário não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      const userData: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: displayName || result.user.email?.split('@')[0] || '',
        photoURL: result.user.photoURL || undefined
      };
      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData));
    } catch (error: any) {
      setUser(null);
      localStorage.removeItem('auth-user');
      throw new Error('Erro ao criar usuário: ' + (error.message || '')); 
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('auth-user');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const signInAsGuest = () => {
    const guestUser: User = {
      uid: 'guest-user',
      email: 'convidado@sistema.com',
      displayName: 'Usuário Convidado'
    };
    
    setUser(guestUser);
    localStorage.setItem('auth-user', JSON.stringify(guestUser));
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}