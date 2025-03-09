
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isAllowedDomain, getAllowedDomainsMessage } from '@/utils/auth';

export const useAuth = () => {
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Session check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth event:', event);
        console.log('Session:', session);

        if (event === 'SIGNED_IN' && session) {
          const email = session.user.email;
          if (email && !isAllowedDomain(email)) {
            try {
              await supabase.auth.signOut();
              setError(`Only ${getAllowedDomainsMessage()} email addresses are allowed.`);
              setIsAuthenticated(false);
              navigate('/login');
            } catch (signOutError) {
              console.error('Error during sign out:', signOutError);
            }
            return;
          }
          setError('');
          setIsAuthenticated(true);
          navigate('/');
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setError('');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        if (event === 'USER_UPDATED') {
          setError('');
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            setIsAuthenticated(!!session);
            if (session) navigate('/');
          } catch (error) {
            console.error('Session update error:', error);
            if (error instanceof Error) setError(error.message);
          }
          return;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    error,
    setError,
    isAuthenticated,
    isLoading
  };
};
