import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type User = {
  avatar_url: string;
  created_at: string | null;
  email: string;
  expo_notification_token: string | null;
  id: string;
  stripe_customer_id: string | null;
  type: string | null;
};

type AuthData = {
  session: Session | null;
  mounting: boolean;
  user: User | null;
};

const AuthContext = createContext<AuthData>({
  session: null,
  mounting: true,
  user: null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounting, setMounting] = useState(true);

  const fetchUser = async (session: Session | null) => {
    if (!session?.user?.id) return;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
    } else {
      setUser(user);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchUser(session);
      setMounting(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchUser(session);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, mounting, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
