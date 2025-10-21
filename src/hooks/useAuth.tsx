import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, UserRole, AuthContextType } from "@/types/auth";
import api from "@/api/axios";
import { toast } from "@/components/ui/sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);

  // Validate token on initial load and when user changes
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      setIsValidating(false);
      return false;
    }

    try {
      const response = await api.post("/api/v1/auth/validate-token");
      console.log("Token validation response:", response.data);
      if (response.data.valid) {
        const savedUser = localStorage.getItem("currentUser");
        console.log("Saved user:", savedUser);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          console.log("User set:", user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      const user = response.data.user || response.data.data?.user || null;
      const token =
        response.data.token ||
        response.data.data?.token ||
        response.data.accessToken ||
        null;

      if (!token) {
        toast.error("Login failed: No token received from backend.");
        setIsLoading(false);
        return false;
      }

      setUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("token", token);
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      toast.error("Login failed. Please check your credentials.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      // Redirect to login after logout
      window.location.href = "/login";
    }
  };

  const switchRole = (role: UserRole) => {
    if (user?.role === "super_admin") {
      const newUser = { ...user, role };
      setUser(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const validateToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    try {
      const response = await api.get("/api/v1/auth/validate-token");
      if (response.data.valid) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };

  const isValidToken = async () => {
    const isValid = await validateToken();
    if (!isValid) {
      // Redirect to login if token is invalid
      window.location.href = "/login";
    }
    return isValid;
  };

  return { ...context, isValidToken };
}
