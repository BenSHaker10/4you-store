import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery(undefined, { enabled: user?.role === "admin" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", description: "", image: "", department: "unisex" as string });

  useEffect(() => {
    if (!loading && user && user.role !== "admin") navigate("/");
  }, [user, loading, navigate]);

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category created"); setDialogOpen(false); resetForm(); },
  });
  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category updated"); setDialogOpen(false); resetForm(); },
  });
  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category deleted"); },
  });

  const resetForm = () => {
    setForm({ name: "", nameAr: "", slug: "", description: "", image: "", department: "unisex" });
    setEditingId(null);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, nameAr: cat.nameAr || "", slug: cat.slug, description: cat.description || "", image: cat.image || "", department: cat.department || "unisex" });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form, department: form.department as any });
    } else {
      createMutation.mutate({ ...form, department: form.department as any });
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Categories</h1>
          <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full"><Plus className="w-4 h-4" /> Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value, slug: p.slug || generateSlug(e.target.value) })); }} placeholder="Category name" />
                </div>
                <div>
                  <Label>Name (Arabic)</Label>
                  <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="اسم الفئة" dir="rtl" />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="category-slug" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Category description" />
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
                  <Label>Image URL</Label>
                  <Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground">Create your first category to organize products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{cat.name}</h3>
                    {cat.nameAr && <p className="text-sm text-muted-foreground" dir="rtl">{cat.nameAr}</p>}
                    <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
                    {cat.description && <p className="text-sm text-muted-foreground mt-2">{cat.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate({ id: cat.id }); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
