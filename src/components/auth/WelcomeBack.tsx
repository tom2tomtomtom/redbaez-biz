import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeBackProps {
  onReturn: () => void;
}

export const WelcomeBack = ({ onReturn }: WelcomeBackProps) => {
  const navigate = useNavigate();

  const handleReturn = () => {
    onReturn();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-gray-600">Your email has been confirmed. You can now return to the application.</p>
          <Button 
            onClick={handleReturn}
            className="w-full"
          >
            Return to App
          </Button>
        </div>
      </div>
    </div>
  );
};