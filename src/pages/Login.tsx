import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeBack } from "@/components/auth/WelcomeBack";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAllowedDomainsMessage } from "@/utils/auth";

export const Login = () => {
  const { error, setError } = useAuth();
  const [showReturnMessage, setShowReturnMessage] = useState(false);

  useEffect(() => {
    // Parse both hash and search parameters to catch all auth redirects
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    
    const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token');

    // Show return message for various successful auth scenarios
    if (type === 'recovery' || type === 'signup' || accessToken) {
      setShowReturnMessage(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorCode === 'otp_expired') {
      setError("The confirmation link has expired. Please request a new one by trying to sign in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setError]);

  if (showReturnMessage) {
    return <WelcomeBack onReturn={() => setShowReturnMessage(false)} />;
  }

  return (
    <LoginForm
      error={error}
      allowedDomainsMessage={getAllowedDomainsMessage('or')}
    />
  );
};