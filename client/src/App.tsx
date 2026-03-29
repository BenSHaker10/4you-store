import Notebook from "./pages/Notebook";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { LanguageProvider } from "./contexts/LanguageContext";
import BrandsBar from "./components/BrandsBar";


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
      {/* Protected pages */}
      <Route path="/notebook" component={Notebook} />
        <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:slug" component={ProductDetail} />
