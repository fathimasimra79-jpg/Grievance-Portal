import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  useGetCurrentUser, 
  useLoginUser, 
  useRegisterStudent,
  getGetCurrentUserQueryKey
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  const { data: user, isLoading, error } = useGetCurrentUser({
    request: getAuthHeaders(),
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Login Successful", description: `Welcome back, ${data.user.name}` });
        
        // Redirect based on role
        if (data.user.role === 'admin') setLocation("/admin/dashboard");
        else if (data.user.role === 'department') setLocation("/department/dashboard");
        else setLocation("/student/dashboard");
      },
      onError: (err: any) => {
        toast({ 
          title: "Login Failed", 
          description: err?.error || "Invalid credentials", 
          variant: "destructive" 
        });
      }
    }
  });

  const registerMutation = useRegisterStudent({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Registration Successful", description: "Your account has been created." });
        setLocation("/student/dashboard");
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration Failed", 
          description: err?.error || "Something went wrong", 
          variant: "destructive" 
        });
      }
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    setLocation("/");
    toast({ title: "Logged out", description: "You have been successfully logged out." });
  };

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout
  };
}
