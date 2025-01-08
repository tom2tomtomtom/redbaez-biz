import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  error: string;
  email: string;
  onEmailChange: (email: string) => void;
  onResendLink: () => void;
}

export const LoginForm = ({ error, email, onEmailChange, onResendLink }: LoginFormProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Sign in with your redbaez.com email</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="space-y-2">
            <AlertDescription>{error}</AlertDescription>
            {error.includes('expired') && (
              <div className="pt-2 flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border rounded-md"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
                <Button 
                  onClick={onResendLink}
                  variant="secondary"
                  className="w-full"
                >
                  Send New Link
                </Button>
              </div>
            )}
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