import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Plus, Receipt, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/formatPrice";
import { localDateKey } from "@/lib/profit/range";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type ExpenseRow,
} from "@/lib/profit/queries";

export type ExpenseInput = {
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
};

function ExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar") ?? false;
  const [date, setDate] = useState(() => localDateKey(new Date()));
  const [category, setCategory] = useState<ExpenseCategory>("ads");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(localDateKey(new Date()));
      setCategory("ads");
      setAmount("");
      setNote("");
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const submit = async () => {
    const value = Number(amount.replace(",", "."));
    if (!date) {
      setError(t("dashboard.profit.expenses.invalidDate"));
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError(t("dashboard.profit.expenses.invalidAmount"));
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ expenseDate: date, category, amount: value, note: note.trim() || null });
      onOpenChange(false);
    } catch {
      toast.error(t("dashboard.profit.expenses.addFailed"));
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={isRtl ? "rtl" : undefined}>
        <DialogHeader>
          <DialogTitle>{t("dashboard.profit.expenses.addTitle")}</DialogTitle>
          <DialogDescription>{t("dashboard.profit.expenses.addDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="expense-date">{t("dashboard.profit.expenses.date")}</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">{t("dashboard.profit.expenses.category")}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger id="expense-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir={isRtl ? "rtl" : undefined}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`dashboard.profit.expenses.categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">{t("dashboard.profit.expenses.amount")}</Label>
            <Input
              id="expense-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-note">{t("dashboard.profit.expenses.note")}</Label>
            <Textarea
              id="expense-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("dashboard.profit.expenses.cancel")}
          </Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("dashboard.profit.expenses.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesCard({
  rows,
  onAdd,
  onDelete,
}: {
  rows: ExpenseRow[];
  onAdd: (input: ExpenseInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar") ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryLabel = (c: string) =>
    (EXPENSE_CATEGORIES as readonly string[]).includes(c)
      ? t(`dashboard.profit.expenses.categories.${c}`)
      : c;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      toast.error(t("dashboard.profit.expenses.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{t("dashboard.profit.expenses.title")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("dashboard.profit.expenses.description")}
            </p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("dashboard.profit.expenses.add")}
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {t("dashboard.profit.expenses.noExpenses")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {categoryLabel(r.category)}
                    </Badge>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {r.expense_date}
                    </span>
                  </div>
                  {r.note && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.note}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(r.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(r)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={onAdd} />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent dir={isRtl ? "rtl" : undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.profit.expenses.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.profit.expenses.deleteConfirmBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("dashboard.profit.expenses.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("dashboard.profit.expenses.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
