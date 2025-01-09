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
                  brand: 'rgb(59 130 246)', // bg-blue-500
                  brandAccent: 'rgb(29 78 216)', // bg-blue-700
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
          view="magic_link"
        />
      </div>
    </div>
  );
};