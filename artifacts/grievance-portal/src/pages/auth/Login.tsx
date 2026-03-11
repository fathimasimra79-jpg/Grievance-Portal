import React from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GraduationCap, ShieldCheck, Building2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { LoginRequestRole } from "@workspace/api-client-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login({ role }: { role: 'student' | 'admin' | 'department' }) {
  const { login, isLoggingIn } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: role !== 'student' ? { email: 'admin@university.edu', password: 'admin123' } : {}
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    login({ data: { ...data, role: role as LoginRequestRole } });
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'admin': return { icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100', title: 'Administrator Login' };
      case 'department': return { icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'Department Login' };
      default: return { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', title: 'Student Login' };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -z-10" />
      
      <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <Card className="border-t-4 border-t-primary shadow-2xl">
          <CardHeader className="text-center pb-8 pt-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 ${config.bg} ${config.color} shadow-inner`}>
              <Icon className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl">{config.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  placeholder="name@example.com" 
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...register("password")}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={isLoggingIn}>
                {isLoggingIn ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            {role === 'student' && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/student/register" className="text-primary font-semibold hover:underline">
                  Register here
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
