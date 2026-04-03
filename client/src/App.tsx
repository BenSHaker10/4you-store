import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import AuthGuard from "./components/AuthGuard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Account from "./pages/Account";
import Login from "./pages/Login";
import About from "./pages/About";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import { lazy, Suspense } from "react";

// Lazy-loaded admin pages for better code splitting
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { LanguageProvider } from "./contexts/LanguageContext";
import BrandsBar from "./components/BrandsBar";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import SEOHead from "./components/SEOHead";

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black animate-spin mx-auto mb-4" />
        <p className="text-[11px] font-sans text-black/30 tracking-wide uppercase">Loading...</p>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.includes(location) || location.startsWith("/reset-password");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <BrandsBar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Auth pages - no layout */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/about" component={About} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/account" component={Account} />
      {/* Admin pages - lazy loaded */}
      <Route path="/admin">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense>}</Route>
      <Route path="/admin/products">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminProducts /></Suspense>}</Route>
      <Route path="/admin/products/new">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminProductForm /></Suspense>}</Route>
      <Route path="/admin/products/:id">{(params) => <Suspense fallback={<AdminLoadingFallback />}><AdminProductForm /></Suspense>}</Route>
      <Route path="/admin/orders">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminOrders /></Suspense>}</Route>
      <Route path="/admin/categories">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminCategories /></Suspense>}</Route>
      <Route path="/admin/coupons">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminCoupons /></Suspense>}</Route>
      <Route path="/admin/settings">{() => <Suspense fallback={<AdminLoadingFallback />}><AdminSettings /></Suspense>}</Route>
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <CartProvider>
              <Toaster />
              <AuthGuard>
                <SEOHead />
                <AppLayout>
                  <Router />
                </AppLayout>
                <FloatingWhatsApp />
                <PWAInstallPrompt />
              </AuthGuard>
            </CartProvider>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
