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
            try {
              await supabase.auth.signOut();
              setError(`Only ${getAllowedDomainsMessage()} email addresses are allowed.`);
            } catch (err) {
              if (!(err as AuthError).message.includes('session_not_found')) {
                setError(getErrorMessage(err as AuthError));
              }
            }
            return;
          }
          navigate('/');
        }
        
        if (event === 'SIGNED_OUT') {
          setError('');
        }

        if (event === 'USER_UPDATED') {
          try {
            const { error } = await supabase.auth.getSession();
            if (error) setError(getErrorMessage(error));
          } catch (err) {
            setError(getErrorMessage(err as AuthError));
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
    if (error.message.includes('session_not_found')) {
      return 'Your session has expired. Please sign in again.';
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