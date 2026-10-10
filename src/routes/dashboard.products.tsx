import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ImageIcon,
  MoreHorizontal,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useSubscription } from "@/hooks/use-subscription";
import { ExpiredOverlay } from "@/components/dashboard/ExpiredOverlay";
import { PageHeader, EmptyState } from "@/components/dashboard/PageHeader";
import {
  ProductFormDialog,
  type Product,
  type ProductVariant,
} from "@/components/dashboard/ProductFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Img } from "@/components/ui/Img";
import { formatPrice as fmtPrice } from "@/lib/storeTheme";
import { cn } from "@/lib/utils";
import { ProductImportDialog } from "@/components/dashboard/ProductImportDialog";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products — Fennecly" }] }),
});

type SortField = "price" | "stock" | "sales_count";
type SortDir = "asc" | "desc";

function ProductsPage() {
  const { user } = useAuth();
  const { currentStore, loading: storeLoading } = useCurrentStore();
  const { isExpired } = useSubscription();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [lastImport, setLastImport] = useState<{ imported_rows: number; created_at: string; filename: string | null } | null>(null);

  const formatPrice = (n: number) => fmtPrice(n, currentStore?.currency ?? "DZD");

  const marginFor = (p: Product): number | null =>
    p.cost_price != null && p.price > 0
      ? Math.round(((p.price - p.cost_price) / p.price) * 100)
      : null;

  const load = useCallback(async () => {
    if (!user || storeLoading) return;
    if (!currentStore?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const selectCols =
        "id,name,description,price,sale_price,stock,category,images,sku,weight,tags,status,variants,sales_count,user_id,store_id";
      const base = () =>
        supabase.from("products").select(selectCols).order("created_at", { ascending: false });
      const storeScoped = await base().eq("store_id", currentStore.id);
      let data = storeScoped.data ?? [];
      if (data.length === 0 && !storeScoped.error) {
        const legacy = await base().eq("user_id", user.id);
        if (legacy.error) {
          toast.error("Failed to load products. Please try again.");
          return;
        }
        data = legacy.data ?? [];
        if (import.meta.env.DEV && data.length > 0) {
          console.warn(
            `[products] ${data.length} product(s) loaded via user_id fallback (store_id is null/wrong on these rows). ` +
              `Run: UPDATE public.products SET store_id = '${currentStore.id}' WHERE user_id = '${user.id}' AND store_id IS NULL;`,
          );
        }
      }
      if (storeScoped.error) {
        toast.error("Failed to load products. Please try again.");
        return;
      }
      // Fetch all product costs in a single query (private table, user RLS).
      const costMap: Record<string, number> = {};
      const productIds = data.map((p) => p.id);
      if (productIds.length > 0) {
        const { data: costs } = await supabase
          .from("product_costs")
          .select("product_id,cost_price")
          .in("product_id", productIds);
        for (const c of costs ?? []) costMap[c.product_id] = Number(c.cost_price);
      }
      setProducts(
        data.map((p) => ({
          ...p,
          price: Number(p.price),
          sale_price: p.sale_price != null ? Number(p.sale_price) : null,
          images: p.images ?? [],
          tags: p.tags ?? [],
          status: (p.status ?? "draft") as "draft" | "published",
          variants: (Array.isArray(p.variants) ? p.variants : []) as ProductVariant[],
          sales_count: p.sales_count ?? 0,
          cost_price: costMap[p.id] ?? null,
        })),
      );
      setSelected(new Set());

      // Load last import log
      const { data: lastImportData } = await (supabase as any)
        .from("import_logs")
        .select("imported_rows, created_at, filename")
        .eq("merchant_id", user.id)
        .eq("type", "products")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastImportData) setLastImport(lastImportData);
    } catch {
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, currentStore?.id, storeLoading]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ig = params.get("instagram");
    if (ig === "connected") {
      toast.success("Instagram account connected! You can now import photos.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (ig === "error" || ig === "token_error") {
      toast.error("Failed to connect Instagram. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (ig === "missing_config") {
      toast.error("Instagram is not configured. Contact the store owner.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ) as string[];

  const filtered = products
    .filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchCategory = filterCategory === "all" || p.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      return (a[sortField] ?? 0) > (b[sortField] ?? 0) ? dir : -dir;
    });

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    setBulkDeleting(true);
    const { error } = await supabase.from("products").delete().in("id", Array.from(selected));
    setBulkDeleting(false);
    if (error) {
      toast.error("Failed to delete products. Please try again.");
      return;
    }
    toast.success(`${selected.size} product(s) deleted`);
    setSelected(new Set());
    load();
  };

  const bulkSetStatus = async (status: "draft" | "published") => {
    const { error } = await supabase
      .from("products")
      .update({ status })
      .in("id", Array.from(selected));
    if (error) {
      toast.error("Failed to update products. Please try again.");
      return;
    }
    toast.success(`${selected.size} product(s) set to ${status}`);
    setSelected(new Set());
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("products").delete().eq("id", deleting.id);
    if (error) {
      toast.error("Failed to delete product. Please try again.");
      return;
    }
    toast.success("Product deleted");
    setDeleting(null);
    load();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {isExpired && <ExpiredOverlay />}
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage everything you sell in one place."
        icon={PackageSearch}
        gradient="from-violet-500 via-fuchsia-500 to-pink-500"
        actions={
          <div className="flex items-center gap-2">
            {lastImport && (
              <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last import: {lastImport.imported_rows} products — {formatDistanceToNow(new Date(lastImport.created_at), { addSuffix: true })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              disabled={isExpired}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import from Excel
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              disabled={isExpired}
            >
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </div>
        }
      />

      {!loading && products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Start building your catalog by adding your first product."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add your first product
            </Button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/60 overflow-hidden">
            {/* Filter bar */}
            <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between flex-wrap">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                {categories.length > 0 && (
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {filtered.length} of {products.length} product{products.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="px-4 py-2 bg-muted/50 border-b border-border/60 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">{selected.size} selected</span>
                <Button size="sm" variant="secondary" onClick={() => bulkSetStatus("published")}>
                  Publish
                </Button>
                <Button size="sm" variant="secondary" onClick={() => bulkSetStatus("draft")}>
                  Set Draft
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[40px]">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("price")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Price <SortIcon field="price" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("stock")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Stock <SortIcon field="stock" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer select-none"
                      onClick={() => handleSort("sales_count")}
                    >
                      <span className="inline-flex items-center gap-1">
                        Sales <SortIcon field="sales_count" />
                      </span>
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        Loading products…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        No products match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={() => toggleOne(p.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="h-11 w-11 rounded-md bg-muted overflow-hidden shrink-0">
                            {p.images[0] ? (
                              <Img
                                src={p.images[0]}
                                alt={p.name}
                                objectFit="cover"
                                className="h-full w-full"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                              {p.description}
                            </div>
                          )}
                          {p.sku && (
                            <div className="text-xs text-muted-foreground">SKU: {p.sku}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.category ? (
                            <Badge variant="secondary" className="font-normal">
                              {p.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.status === "published" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-normal">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground font-normal">
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          <div>{formatPrice(p.price)}</div>
                          {p.sale_price != null && (
                            <div className="text-xs text-emerald-600">
                              {formatPrice(p.sale_price)}
                            </div>
                          )}
                          {(() => {
                            const m = marginFor(p);
                            if (m === null) return null;
                            return (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "mt-1 font-normal",
                                  m >= 0
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
                                )}
                              >
                                {t("dashboard.costs.marginBadge", { pct: m })}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.stock === 0 ? (
                            <Badge
                              variant="outline"
                              className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-normal"
                            >
                              Out of stock
                            </Badge>
                          ) : p.stock < 5 ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-normal"
                            >
                              {p.stock} left
                            </Badge>
                          ) : (
                            <span className="text-sm">{p.stock}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">{p.sales_count ?? 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(p);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleting(p)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSaved={load}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" will be permanently removed. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => { void load(); }}
      />
    </div>
  );
}
