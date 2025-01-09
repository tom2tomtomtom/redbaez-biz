import { 
  useEffect, 
  useState 
} from "react";
import { useNavigate } from "react-router-dom";
import { 
  supabase 
} from "@/integrations/supabase/client";
import { 
  AuthError, 
  AuthApiError, 
  Session,
  AuthChangeEvent
} from "@supabase/supabase-js";
import { WelcomeBack } from "@/components/auth/WelcomeBack";
import { LoginForm } from "@/components/auth/LoginForm";

const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];

export const Login = () => {
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showReturnMessage, setShowReturnMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');
    const type = hashParams.get('type');

    if (type === 'recovery' || type === 'signup') {
      setShowReturnMessage(true);
    }

    if (errorCode === 'otp_expired') {
      setError("The confirmation link has expired. Please request a new one by trying to sign in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state change:", event);
        
        if (event === 'SIGNED_IN' && session) {
          const email = session.user.email;
          if (email && !ALLOWED_DOMAINS.some(domain => email.endsWith(`@${domain}`))) {
            await supabase.auth.signOut();
            setError(`Only ${ALLOWED_DOMAINS.join(' and ')} email addresses are allowed.`);
            return;
          }
          navigate("/");
        }
        
        if (event === 'SIGNED_OUT') {
          setError("");
        }

        if (event === 'USER_UPDATED') {
          const { error } = await supabase.auth.getSession();
          if (error) {
            setError(getErrorMessage(error));
          }
        }

        if (event === 'PASSWORD_RECOVERY') {
          setError("A confirmation link has been sent to your email. This link will expire in 5 minutes. Please check your inbox.");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendLink = async () => {
    if (!email || !ALLOWED_DOMAINS.some(domain => email.endsWith(`@${domain}`))) {
      setError(`Please enter a valid ${ALLOWED_DOMAINS.join(' or ')} email address.`);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            expiresIn: 300
          }
        }
      });
      
      if (error) {
        if (error instanceof AuthApiError) {
          switch (error.status) {
            case 400:
              if (error.message.includes("invalid_credentials")) {
                setError("Invalid email address. Please check your email and try again.");
              } else {
                setError(error.message);
              }
              break;
            default:
              setError(error.message);
          }
        } else {
          setError(error.message);
        }
      } else {
        setError("A new confirmation link has been sent to your email. This link will expire in 5 minutes.");
      }
    } catch (err) {
      setError("An error occurred while sending the confirmation link.");
    }
  };

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case 'invalid_credentials':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'email_not_confirmed':
          return 'Please verify your email address before signing in.';
        case 'user_not_found':
          return 'No user found with these credentials.';
        case 'invalid_grant':
          return 'Invalid login credentials.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (showReturnMessage) {
    return <WelcomeBack onReturn={() => setShowReturnMessage(false)} />;
  }

  return (
    <LoginForm
      error={error}
      email={email}
      onEmailChange={setEmail}
      onResendLink={handleResendLink}
    />
  );
};