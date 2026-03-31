import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/",
    "/products",
  ];

  // Check if current route is public (includes dynamic routes like /product/:slug)
  const isPublicRoute =
    publicRoutes.includes(location) ||
    location.startsWith("/product/");

  // Auth-only pages (login/register)
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.includes(location);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Sparkles className="w-6 h-6 text-gold animate-pulse" />
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>4 YOU</span>
          </div>
          <div className="w-6 h-6 border-2 border-border border-t-gold rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // If on auth page and authenticated, redirect to home
  if (isAuthPage && isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  // If not on public route and not authenticated, redirect to login
  if (!isPublicRoute && !isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}
