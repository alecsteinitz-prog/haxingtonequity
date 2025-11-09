import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DevModeBanner = () => {
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

  if (!DEV_MODE) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-500/10 border-yellow-500/50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
        <strong>🔧 Developer Mode Active</strong> — Authentication Disabled. Using mock user (dev_user_001).
      </AlertDescription>
    </Alert>
  );
};
