import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  error: string;
  allowedDomainsMessage: string;
}

export const LoginForm = ({
  error,
  allowedDomainsMessage
}: LoginFormProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Sign in with your {allowedDomainsMessage} email</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(82 183 136)', // Green color matching the image
                  brandAccent: 'rgb(72 163 116)', // Darker green for hover
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full',
              input: 'w-full'
            }
          }}
          providers={[]}
          view="sign_in"
        />
      </div>
    </div>
  );
};