import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Plus, Save, Trash2 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== "new";
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: categoriesData } = trpc.categories.list.useQuery();
  const { data: existingProduct } = trpc.products.bySlug.useQuery(
    { slug: "__id__" },
    { enabled: false }
  );

  // For edit mode, we fetch all products and find by id
  const { data: allProducts } = trpc.products.list.useQuery({ limit: 200 }, { enabled: !!isEdit });
  const editProduct = isEdit ? allProducts?.items.find(p => p.id === parseInt(id)) : null;
  const { data: editProductDetail } = trpc.products.bySlug.useQuery(
    { slug: editProduct?.slug || "" },
    { enabled: !!editProduct?.slug }
  );

  const [form, setForm] = useState({
    name: "", nameAr: "", slug: "", description: "", descriptionAr: "",
    price: "", compareAtPrice: "", brand: "", sku: "",
    stock: 0, categoryId: "", department: "unisex" as string, featured: false, isActive: true, tags: "",
  });

  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [options, setOptions] = useState<{ name: string; value: string; priceModifier: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editProductDetail) {
      setForm({
        name: editProductDetail.name || "",
        nameAr: editProductDetail.nameAr || "",
        slug: editProductDetail.slug || "",
        description: editProductDetail.description || "",
        descriptionAr: editProductDetail.descriptionAr || "",
        price: editProductDetail.price || "",
        compareAtPrice: editProductDetail.compareAtPrice || "",
        brand: editProductDetail.brand || "",
        sku: editProductDetail.sku || "",
        stock: editProductDetail.stock || 0,
        categoryId: editProductDetail.categoryId?.toString() || "",
        department: (editProductDetail as any).department || "unisex",
        featured: editProductDetail.featured || false,
        isActive: editProductDetail.isActive !== false,
        tags: editProductDetail.tags || "",
      });
      setImages(editProductDetail.images?.map(i => ({ url: i.url, alt: i.alt || "" })) || []);
      setOptions(editProductDetail.options?.map(o => ({ name: o.name, value: o.value, priceModifier: o.priceModifier || "0" })) || []);
    }
  }, [editProductDetail]);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: async (data) => {
      // Add images
      for (const img of images) {
        await addImageMutation.mutateAsync({ productId: data.id!, url: img.url, alt: img.alt });
      }
      // Add options
      for (const opt of options) {
        if (opt.name && opt.value) {
          await addOptionMutation.mutateAsync({ productId: data.id!, ...opt });
        }
      }
      utils.products.list.invalidate();
      toast.success("Product created!");
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product updated!");
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const addImageMutation = trpc.products.addImage.useMutation();
  const addOptionMutation = trpc.products.addOption.useMutation();
  const uploadMutation = trpc.upload.image.useMutation();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
        const result = await uploadMutation.mutateAsync({
          base64,
          filename: file.name,
          contentType: file.type,
        });
        setImages(prev => [...prev, { url: result.url, alt: file.name }]);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addOption = () => {
    setOptions(prev => [...prev, { name: "", value: "", priceModifier: "0" }]);
  };

  const updateOption = (index: number, field: string, value: string) => {
    setOptions(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o));
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.slug) {
      toast.error("Please fill in name, slug, and price");
      return;
    }
    if (isEdit && editProduct) {
      updateMutation.mutate({
        id: editProduct.id,
        ...form,
        department: form.department as any,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        compareAtPrice: form.compareAtPrice || null,
      });
    } else {
      createMutation.mutate({
        ...form,
        department: form.department as any,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        compareAtPrice: form.compareAtPrice || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8 max-w-4xl">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-heading)" }}>
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Luxury Lipstick" />
              </div>
              <div>
                <Label>Name (Arabic)</Label>
                <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="أحمر شفاه فاخر" dir="rtl" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="luxury-lipstick" />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Brand name" />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="SKU-001" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(p => ({ ...p, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categoriesData?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full min-h-[100px] px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Product description..."
                />
              </div>
              <div className="md:col-span-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="luxury, lipstick, matte" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Price *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="29.99" />
              </div>
              <div>
                <Label>Compare at Price</Label>
                <Input type="number" step="0.01" value={form.compareAtPrice} onChange={e => setForm(p => ({ ...p, compareAtPrice: e.target.value }))} placeholder="39.99" />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} placeholder="100" />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} />
                <Label>Featured Product</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Product Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload"}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Product Options</h2>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                <Plus className="w-3 h-3" /> Add Option
              </Button>
            </div>
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">No options added. Add options like size, color, or type.</p>
            ) : (
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Option Name</Label>
                      <Input value={opt.name} onChange={e => updateOption(i, "name", e.target.value)} placeholder="Size / Color / Type" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Value</Label>
                      <Input value={opt.value} onChange={e => updateOption(i, "value", e.target.value)} placeholder="Small / Red / Matte" />
                    </div>
                    <div className="w-28">
                      <Label className="text-xs">Price +/-</Label>
                      <Input type="number" step="0.01" value={opt.priceModifier} onChange={e => updateOption(i, "priceModifier", e.target.value)} placeholder="0" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)} className="text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" className="gap-2 rounded-full" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="w-4 h-4" /> {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="outline" size="lg" className="rounded-full">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
