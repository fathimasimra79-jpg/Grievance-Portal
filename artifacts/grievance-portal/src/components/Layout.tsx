import React from "react";
import { Link, useLocation } from "wouter";
import { LogOut, GraduationCap, LayoutDashboard, FileText, BarChart3, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Notifications } from "./Notifications";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return <>{children}</>;

  const getLinks = () => {
    switch (user.role) {
      case "student":
        return [
          { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/student/complaint/new", label: "New Complaint", icon: FileText },
        ];
      case "admin":
        return [
          { href: "/admin/dashboard", label: "Dashboard & Analytics", icon: BarChart3 },
        ];
      case "department":
        return [
          { href: "/department/dashboard", label: "Assigned Complaints", icon: LayoutDashboard },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border/50 shadow-sm z-10 h-screen sticky top-0">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">Grievance Portal</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {(user as any).department ? (user as any).department : user.role} Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="font-display font-bold">Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Notifications />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 top-[73px] z-20 bg-card border-b p-4 flex flex-col animate-in slide-in-from-top-2">
            <nav className="flex-1 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                      location === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <Button variant="destructive" className="mt-auto w-full" onClick={logout}>
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
          </div>
        )}

        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-end p-6 bg-transparent sticky top-0 z-10 pointer-events-none">
          <div className="pointer-events-auto bg-card/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-sm flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <div className="w-px h-6 bg-border"></div>
            <Notifications />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 pt-4 md:pt-0">
          <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
