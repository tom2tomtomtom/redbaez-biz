import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

export const Login = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error parameters in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    if (errorCode === 'otp_expired') {
      setError("The confirmation link has expired. Please request a new one by trying to sign in again.");
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Check if the email is from redbaez.com domain
        const email = session.user.email;
        if (email && !email.endsWith('@redbaez.com')) {
          await supabase.auth.signOut();
          setError("Only redbaez.com email addresses are allowed.");
          return;
        }
        navigate("/");
      }
      if (event === "SIGNED_OUT") {
        setError(""); // Clear errors on sign out
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Sign in with your redbaez.com email</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};