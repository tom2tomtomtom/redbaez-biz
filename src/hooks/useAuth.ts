import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isAllowedDomain, getAllowedDomainsMessage } from '@/utils/auth';

export const useAuth = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          const email = session.user.email;
          if (email && !isAllowedDomain(email)) {
            // Wait a brief moment to ensure session is established
            setTimeout(async () => {
              try {
                await supabase.auth.signOut();
                setError(`Only ${getAllowedDomainsMessage()} email addresses are allowed.`);
              } catch (signOutError) {
                console.error('Error during sign out:', signOutError);
              }
              navigate('/login');
            }, 100);
            return;
          }
          navigate('/');
        }
        
        if (event === 'SIGNED_OUT') {
          setError('');
          navigate('/login');
        }

        if (event === 'USER_UPDATED') {
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError && sessionError.message !== 'session_not_found') {
              setError(getErrorMessage(sessionError));
            }
          } catch (error) {
            console.error('Error checking session:', error);
          }
        }

        if (event === 'PASSWORD_RECOVERY') {
          setError('A confirmation link has been sent to your email. This link will expire in 5 minutes. Please check your inbox.');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError): string => {
    if (error.message === 'session_not_found') {
      return '';
    }
    
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please verify your email address before signing in.';
      case 'User not found':
        return 'No user found with these credentials.';
      default:
        return error.message;
    }
  };

  return {
    error,
    setError
  };
};