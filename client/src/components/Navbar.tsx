import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingBag, Search, User, Menu, X, LogOut, Package, Settings, LayoutDashboard, Heart, ChevronDown, Globe } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const { t, toggleLang, isRTL } = useLanguage();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const DEPARTMENTS = [
    { label: t.nav.women, value: "women" },
    { label: t.nav.men, value: "men" },
    { label: t.nav.youth, value: "youth" },
    { label: t.nav.kids, value: "kids" },
  ];

  const CATEGORIES = [
    { name: t.categories.perfumes, slug: "perfumes" },
    { name: t.categories.makeup, slug: "makeup" },
    { name: t.categories.skincare, slug: "skincare" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveDept(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header ref={navRef} className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/98 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-white"}`}>

      {/* ─── Top Bar ─── */}
      <div className="bg-white text-black border-b border-black/10">
        <div className="container">
          <div className="text-center text-[9px] md:text-[10px] py-2 tracking-widest uppercase font-sans text-black/50">
            {t.topBar.freeShipping} &nbsp;&mdash;&nbsp; {t.topBar.newArrivals}
          </div>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <div className="border-b border-black/[0.06]">
        <div className="container">
          <div className="flex items-center h-14 md:h-16 gap-4 md:gap-6">

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 hover:opacity-60 transition-opacity"
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setActiveDept(null); }}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 group">
              <h1 className="font-sans text-2xl md:text-3xl tracking-tight transition-opacity duration-300 group-hover:opacity-60 font-bold uppercase">
                4 YOU
              </h1>
            </Link>

            {/* Department Navigation - Desktop */}
            <nav className={`hidden lg:flex items-center gap-1 ${isRTL ? "mr-6" : "ml-6"}`}>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.value}
                  className={`px-4 py-2 text-[11px] tracking-widest uppercase font-sans transition-all duration-300 ${
                    activeDept === dept.value
                      ? "text-black border-b-2 border-black"
                      : "text-black/40 hover:text-black"
                  }`}
                  onClick={() => setActiveDept(activeDept === dept.value ? null : dept.value)}
                >
                  {dept.label}
                </button>
              ))}
              <Link
                href="/products?featured=true"
                className="px-4 py-2 text-[11px] tracking-widest uppercase font-sans text-black/40 hover:text-black transition-all duration-300"
              >
                {t.nav.sale}
              </Link>
            </nav>

            {/* Search Bar - Desktop */}
            <div className={`hidden lg:flex flex-1 max-w-sm ${isRTL ? "mr-auto" : "ml-auto"}`}>
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full group">
                  <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25 group-focus-within:text-black/50 transition-colors`} strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder={t.nav.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 bg-black/[0.03] border border-black/[0.06] text-[12px] font-sans focus:outline-none focus:border-black/20 transition-all duration-300 placeholder:text-black/25`}
                  />
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className={`flex items-center gap-0 ${isRTL ? "mr-auto lg:mr-0" : "ml-auto lg:ml-0"}`}>

              {/* Language */}
              <button
                className="p-2.5 hover:opacity-50 transition-opacity flex items-center gap-1"
                onClick={toggleLang}
                title={t.language}
              >
                <Globe className="w-3.5 h-3.5 text-black/40" strokeWidth={1.5} />
                <span className="text-[9px] font-sans tracking-wider text-black/40 uppercase">{isRTL ? "EN" : "AR"}</span>
              </button>

              {/* Mobile Search */}
              <button
                className="lg:hidden p-2.5 hover:opacity-50 transition-opacity"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="w-4 h-4 text-black/50" strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <button
                className="hidden md:flex p-2.5 hover:opacity-50 transition-opacity"
                onClick={() => { import("sonner").then(m => m.toast.info(t.common.comingSoon)); }}
              >
                <Heart className="w-4 h-4 text-black/50" strokeWidth={1.5} />
              </button>

              {/* User */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2.5 hover:opacity-50 transition-opacity flex items-center gap-1.5">
                      <User className="w-4 h-4 text-black/50" strokeWidth={1.5} />
                      <span className="hidden md:inline text-[10px] font-sans tracking-wider text-black/50 max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none shadow-xl border-black/[0.06] bg-white">
                    <div className="px-4 py-3 border-b border-black/[0.06]">
                      <p className="text-[12px] font-sans font-medium">{user?.name || "User"}</p>
                      <p className="text-[10px] text-black/40 font-sans">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="py-2.5 text-[11px] font-sans text-black/60 hover:text-black rounded-none">
                      <Settings className="w-3.5 h-3.5 me-2" strokeWidth={1.5} /> {t.nav.account}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/orders")} className="py-2.5 text-[11px] font-sans text-black/60 hover:text-black rounded-none">
                      <Package className="w-3.5 h-3.5 me-2" strokeWidth={1.5} /> {t.nav.myOrders}
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="py-2.5 text-[11px] font-sans text-black/60 hover:text-black rounded-none">
                        <LayoutDashboard className="w-3.5 h-3.5 me-2" strokeWidth={1.5} /> {t.nav.adminPanel}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-black/[0.06]" />
                    <DropdownMenuItem onClick={() => logout()} className="py-2.5 text-[11px] font-sans text-red-600 rounded-none">
                      <LogOut className="w-3.5 h-3.5 me-2" strokeWidth={1.5} /> {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="p-2.5 hover:opacity-50 transition-opacity flex items-center gap-1.5">
                  <User className="w-4 h-4 text-black/50" strokeWidth={1.5} />
                  <span className="hidden md:inline text-[10px] font-sans tracking-luxury uppercase text-black/50">{t.nav.login}</span>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="p-2.5 hover:opacity-50 transition-opacity relative group">
                <ShoppingBag className="w-4 h-4 text-black/50 group-hover:text-black transition-colors" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute top-1 right-0.5 bg-black text-white text-[8px] font-sans font-medium rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Department Mega Menu - Desktop ─── */}
      {activeDept && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-white border-b border-black/[0.06] shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="container py-10">
            <div className="grid grid-cols-4 gap-12">
              {/* Categories */}
              <div>
                <h3 className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-6">{isRTL ? "الفئات" : "Categories"}</h3>
                <ul className="space-y-3">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/products?department=${activeDept}&category=${cat.slug}`}
                        className="text-[12px] font-sans text-black/50 hover:text-black transition-colors duration-300"
                        onClick={() => setActiveDept(null)}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/products?department=${activeDept}`}
                      className="text-[11px] font-sans font-medium text-black hover:opacity-60 transition-opacity inline-block mt-2 border-b border-black/20 pb-0.5"
                      onClick={() => setActiveDept(null)}
                    >
                      {t.common.viewAll} →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Trending */}
              <div>
                <h3 className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-6">{isRTL ? "الرائج" : "Trending"}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href={`/products?department=${activeDept}&featured=true`} className="text-[12px] font-sans text-black/50 hover:text-black transition-colors" onClick={() => setActiveDept(null)}>
                      {t.nav.allProducts}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/products?department=${activeDept}`} className="text-[12px] font-sans text-black/50 hover:text-black transition-colors" onClick={() => setActiveDept(null)}>
                      {t.nav.allProducts}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-6">{isRTL ? "أفضل الماركات" : "Top Brands"}</h3>
                <ul className="space-y-3">
                  {["Chanel", "Dior", "Tom Ford", "La Mer", "MAC"].map((brand) => (
                    <li key={brand}>
                      <Link
                        href={`/products?department=${activeDept}&brand=${encodeURIComponent(brand)}`}
                        className="text-[12px] font-sans text-black/50 hover:text-black transition-colors"
                        onClick={() => setActiveDept(null)}
                      >
                        {brand}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Featured */}
              <div className="relative overflow-hidden aspect-[4/3] bg-black flex items-end p-6 group cursor-pointer" onClick={() => { navigate(`/products?department=${activeDept}&featured=true`); setActiveDept(null); }}>
                <div>
                  <p className="text-white/30 text-[9px] tracking-luxury uppercase font-sans mb-2">{isRTL ? "حصري" : "Exclusive"}</p>
                  <p className="text-white font-heading text-xl italic">
                    {t.featured.title}
                  </p>
                  <span className="inline-block mt-3 text-[10px] font-sans tracking-luxury uppercase text-white/50 border-b border-white/20 pb-0.5 group-hover:text-white group-hover:border-white transition-all">
                    {t.home.shopNow}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Search ─── */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-black/[0.06] shadow-lg z-50 lg:hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="container py-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25`} strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.nav.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} py-2.5 bg-black/[0.02] border border-black/[0.06] text-[12px] font-sans focus:outline-none focus:border-black/20 transition-all`}
                />
              </div>
              <button type="button" className="p-2 hover:opacity-50 transition-opacity" onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Mobile Menu ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-black/[0.06] shadow-lg max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="container py-4">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.value}>
                <button
                  className="w-full flex items-center justify-between py-3.5 text-[11px] tracking-luxury uppercase font-sans border-b border-black/[0.04] hover:text-black/60 transition-colors"
                  onClick={() => setActiveDept(activeDept === dept.value ? null : dept.value)}
                >
                  {dept.label}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDept === dept.value ? "rotate-180" : ""}`} strokeWidth={1.5} />
                </button>
                {activeDept === dept.value && (
                  <div className={`${isRTL ? "pr-4" : "pl-4"} py-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200`}>
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products?department=${dept.value}&category=${cat.slug}`}
                        className="block py-2 text-[12px] font-sans text-black/40 hover:text-black transition-colors"
                        onClick={() => { setMobileMenuOpen(false); setActiveDept(null); }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      href={`/products?department=${dept.value}`}
                      className="block py-2 text-[11px] font-sans font-medium text-black"
                      onClick={() => { setMobileMenuOpen(false); setActiveDept(null); }}
                    >
                      {t.common.viewAll} →
                    </Link>
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/products"
              className="block py-3.5 text-[11px] tracking-luxury uppercase font-sans border-b border-black/[0.04] hover:text-black/60 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.products.allProducts}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
