import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  error: string;
  email: string;
  onEmailChange: (email: string) => void;
  onResendLink: () => void;
  allowedDomainsMessage: string;
}

export const LoginForm = ({
  error,
  email,
  onEmailChange,
  onResendLink,
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

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={onResendLink}
          >
            Send Magic Link
          </Button>
        </div>
      </div>
    </div>
  );
};