import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X, Search, Package, Grid3X3, LayoutGrid } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Products() {
  const { t, isRTL } = useLanguage();
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const DEPARTMENTS = [
    { label: t.common.viewAll, value: "all" },
    { label: t.nav.women, value: "women" },
    { label: t.nav.men, value: "men" },
    { label: t.nav.youth, value: "youth" },
    { label: t.nav.kids, value: "kids" },
  ];

  const initialDept = params.get("department") || "all";
  const initialCategory = params.get("category") || "all";
  const initialBrand = params.get("brand") || "all";

  const [search, setSearch] = useState(params.get("search") || "");
  const [department, setDepartment] = useState(initialDept);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: categoriesData } = trpc.categories.list.useQuery();
  const { data: brandsData } = trpc.products.brands.useQuery();

  const categoryId = useMemo(() => {
    if (selectedCategory === "all" || !categoriesData) return undefined;
    const cat = categoriesData.find(c => c.slug === selectedCategory);
    return cat?.id;
  }, [selectedCategory, categoriesData]);

  const featured = params.get("featured") === "true" ? true : undefined;

  const queryInput = useMemo(() => ({
    search: search || undefined,
    categoryId,
    brand: selectedBrand !== "all" ? selectedBrand : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
    featured,
    department: department !== "all" ? department as "women" | "men" | "kids" | "youth" | "unisex" : undefined,
    limit,
    offset: page * limit,
  }), [search, categoryId, selectedBrand, priceRange, featured, department, page]);

  const { data, isLoading } = trpc.products.list.useQuery(queryInput);

  useEffect(() => { setPage(0); }, [search, selectedCategory, selectedBrand, priceRange, department]);

  useEffect(() => {
    const dept = params.get("department") || "all";
    const cat = params.get("category") || "all";
    const brand = params.get("brand") || "all";
    const s = params.get("search") || "";
    setDepartment(dept);
    setSelectedCategory(cat);
    setSelectedBrand(brand);
    setSearch(s);
  }, [searchString]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const clearFilters = () => {
    setSearch("");
    setDepartment("all");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceRange([0, 500]);
    setPage(0);
    navigate("/products");
  };

  const hasActiveFilters = search || department !== "all" || selectedCategory !== "all" || selectedBrand !== "all" || priceRange[0] > 0 || priceRange[1] < 500;

  const pageTitle = featured
    ? (isRTL ? "عروض وتخفيضات" : "Sale & Offers")
    : department !== "all"
      ? (isRTL
          ? `${DEPARTMENTS.find(d => d.value === department)?.label || ""}`
          : `${department.charAt(0).toUpperCase() + department.slice(1)}'s Collection`)
      : selectedCategory !== "all"
        ? (categoriesData?.find(c => c.slug === selectedCategory)?.name || (isRTL ? "المنتجات" : "Products"))
        : (isRTL ? "جميع المنتجات" : "All Products");

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-wide text-black/25 mb-4">
            <a href="/" className="hover:text-black transition-colors">{t.footer.home}</a>
            <span className="text-black/10">/</span>
            <span className="text-black/50">{pageTitle}</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl italic">
            {pageTitle}
          </h1>
          <p className="text-[12px] font-sans text-black/30 mt-3">
            {data ? `${data.total} ${isRTL ? "منتج" : "products"}` : t.common.loading}
          </p>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="border-b border-black/[0.04] bg-white sticky top-[84px] md:top-[92px] z-30">
        <div className="container">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.value}
                onClick={() => setDepartment(dept.value)}
                className={`px-6 py-3.5 text-[10px] font-sans tracking-luxury uppercase whitespace-nowrap transition-all duration-300 border-b-2 ${
                  department === dept.value
                    ? "border-black text-black"
                    : "border-transparent text-black/30 hover:text-black/60"
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20`} strokeWidth={1.5} />
              <input
                type="text"
                placeholder={t.nav.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-2.5 bg-[#f8f8f8] border border-black/[0.06] text-[12px] font-sans focus:outline-none focus:border-black/20 transition-all duration-300 placeholder:text-black/20`}
              />
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-sans tracking-luxury uppercase border transition-all duration-300 ${
                showFilters
                  ? "bg-black text-white border-black"
                  : "border-black/10 text-black/40 hover:text-black hover:border-black/30"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t.common.filter}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] text-[11px] font-sans h-9 border-black/[0.06] bg-[#f8f8f8] rounded-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-black/[0.06] rounded-none">
                <SelectItem value="newest" className="text-[11px] font-sans">{isRTL ? "الأحدث" : "Newest"}</SelectItem>
                <SelectItem value="price-low" className="text-[11px] font-sans">{isRTL ? "السعر: من الأقل" : "Price: Low to High"}</SelectItem>
                <SelectItem value="price-high" className="text-[11px] font-sans">{isRTL ? "السعر: من الأعلى" : "Price: High to Low"}</SelectItem>
                <SelectItem value="popular" className="text-[11px] font-sans">{isRTL ? "الأكثر شعبية" : "Most Popular"}</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden md:flex items-center border border-black/[0.06] overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2.5 transition-all duration-300 ${gridCols === 3 ? "bg-black text-white" : "text-black/20 hover:text-black"}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2.5 transition-all duration-300 ${gridCols === 4 ? "bg-black text-white" : "text-black/20 hover:text-black"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border border-black/[0.06] p-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{t.common.filter}</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[10px] font-sans text-black/40 hover:text-black flex items-center gap-1.5 transition-colors">
                  <X className="w-3 h-3" /> {isRTL ? "مسح الكل" : "Clear All"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2.5 block">{isRTL ? "الفئة" : "Category"}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-[11px] font-sans h-10 border-black/[0.06] rounded-none">
                    <SelectValue placeholder={isRTL ? "جميع الفئات" : "All Categories"} />
                  </SelectTrigger>
                  <SelectContent className="border-black/[0.06] rounded-none">
                    <SelectItem value="all" className="text-[11px] font-sans">{isRTL ? "جميع الفئات" : "All Categories"}</SelectItem>
                    {categoriesData?.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug} className="text-[11px] font-sans">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2.5 block">{isRTL ? "الماركة" : "Brand"}</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="text-[11px] font-sans h-10 border-black/[0.06] rounded-none">
                    <SelectValue placeholder={isRTL ? "جميع الماركات" : "All Brands"} />
                  </SelectTrigger>
                  <SelectContent className="border-black/[0.06] rounded-none">
                    <SelectItem value="all" className="text-[11px] font-sans">{isRTL ? "جميع الماركات" : "All Brands"}</SelectItem>
                    {brandsData?.map(brand => (
                      <SelectItem key={brand} value={brand} className="text-[11px] font-sans">{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2.5 block">
                  {isRTL ? `نطاق السعر: ${priceRange[0]} - ${priceRange[1]} ريال` : `Price: ${priceRange[0]} - ${priceRange[1]} SAR`}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  min={0}
                  max={500}
                  step={10}
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-8">
            {department !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.06] text-[10px] font-sans tracking-wide">
                {DEPARTMENTS.find(d => d.value === department)?.label}
                <button onClick={() => setDepartment("all")} className="hover:text-black/60 transition-colors"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.06] text-[10px] font-sans tracking-wide">
                {categoriesData?.find(c => c.slug === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory("all")} className="hover:text-black/60 transition-colors"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedBrand !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.06] text-[10px] font-sans tracking-wide">
                {selectedBrand}
                <button onClick={() => setSelectedBrand("all")} className="hover:text-black/60 transition-colors"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.06] text-[10px] font-sans tracking-wide">
                "{search}"
                <button onClick={() => setSearch("")} className="hover:text-black/60 transition-colors"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 md:gap-6`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#f5f5f5] mb-3" />
                <div className="h-2 bg-[#f5f5f5] w-1/3 mb-2" />
                <div className="h-3 bg-[#f5f5f5] w-2/3 mb-2" />
                <div className="h-2.5 bg-[#f5f5f5] w-1/4" />
              </div>
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 md:gap-6`}>
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-black/[0.04]">
                <button
                  className="px-5 py-2.5 border border-black/10 text-[10px] font-sans tracking-luxury uppercase hover:bg-black hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  {t.common.previous}
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = page < 3 ? i : page - 2 + i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`w-10 h-10 text-[11px] font-sans transition-all duration-300 ${
                        pageNum === page
                          ? "bg-black text-white"
                          : "border border-black/[0.06] text-black/30 hover:text-black hover:border-black/20"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  className="px-5 py-2.5 border border-black/10 text-[10px] font-sans tracking-luxury uppercase hover:bg-black hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  {t.common.next}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <Package className="w-8 h-8 text-black/10 mx-auto mb-6" strokeWidth={1} />
            <h3 className="font-heading text-xl italic mb-3">{t.common.noResults}</h3>
            <p className="text-[12px] font-sans text-black/30 mb-8 max-w-sm mx-auto">
              {isRTL ? "حاول تعديل البحث أو الفلاتر للعثور على ما تبحث عنه" : "Try adjusting your search or filters"}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-sans tracking-luxury uppercase hover:bg-black/90 transition-all duration-300">
                <X className="w-3 h-3" />
                {isRTL ? "مسح جميع الفلاتر" : "Clear All Filters"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
