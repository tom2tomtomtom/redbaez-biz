import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface LoginFormProps {
  error: string;
  allowedDomainsMessage: string;
}

export const LoginForm = ({
  error,
  allowedDomainsMessage
}: LoginFormProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md space-y-6 p-8 bg-white shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
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
                  brand: 'rgb(82 183 136)',
                  brandAccent: 'rgb(72 163 116)',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90',
              input: 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary',
              label: 'block text-sm font-medium text-gray-700 mb-1',
              message: 'text-sm text-red-500'
            }
          }}
          providers={[]}
          view="sign_in"
        />
      </Card>
    </div>
  );
};