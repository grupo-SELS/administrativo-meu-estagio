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
  currentUser: User | null; 
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; 
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
      console.error('❌ AuthContext - Erro no login:', error);
      setUser(null);
      localStorage.removeItem('auth-user');
      

      let errorMessage = 'Credenciais inválidas ou usuário não encontrado.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Usuário não encontrado. Verifique o email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Senha incorreta. Tente novamente.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta conta foi desabilitada.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Credenciais inválidas. Verifique email e senha.';
            break;
          default:
            errorMessage = error.message || 'Erro desconhecido no login.';
        }
      }
      
      const customError = new Error(errorMessage);
      (customError as any).code = error.code;
      throw customError;
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
      console.error('❌ AuthContext - Erro no registro:', error);
      setUser(null);
      localStorage.removeItem('auth-user');
      throw new Error('Erro ao criar usuário: ' + (error.message || '')); 
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('❌ AuthContext - Erro ao enviar email de reset:', error);
      
      let errorMessage = 'Erro ao enviar email de redefinição.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Email não encontrado. Verifique o endereço digitado.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas. Aguarde antes de tentar novamente.';
            break;
          default:
            errorMessage = error.message || 'Erro desconhecido ao resetar senha.';
        }
      }
      
      const customError = new Error(errorMessage);
      (customError as any).code = error.code;
      throw customError;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('auth-user');
    } catch (error) {
      console.error('❌ AuthContext - Erro no logout:', error);
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
    currentUser: user, 
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword, 
    signInAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}