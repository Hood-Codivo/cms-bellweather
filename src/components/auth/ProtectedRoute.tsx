import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { LoginForm } from "./LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
}

export function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading, isValidToken } = useAuth();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && !isLoading) {
        const isValid = await isValidToken();
        if (!isValid && location.pathname !== "/login") {
          navigate("/login", {
            state: { from: location },
            replace: true,
          });
        }
      }
    };

    checkAuth();
  }, [user, isLoading, navigate, location, isValidToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
