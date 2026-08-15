import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartKind = "fruit" | "joki" | "account";

export interface CartItem {
  id: string;
  kind: CartKind;
  name: string;
  price: number;
  priceRm?: number | null;
  originalPrice?: number;
  originalPriceRm?: number | null;
  discountPercent?: number;
  image_url?: string | null;
  qty: number;
  maxStock: number | null; // null = unlimited (joki tanpa slot terbatas)
  meta?: string; // extra note (level/race/fruit for accounts, category for fruits)
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, kind: CartKind) => void;
  updateQty: (id: string, kind: CartKind, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
  totalPriceRm: number | null;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE = "tbp_cart_v1";

function keyOf(id: string, kind: CartKind) {
  return `${kind}:${id}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((p) => keyOf(p.id, p.kind) === keyOf(item.id, item.kind));
      const cap = item.maxStock == null ? Infinity : Math.max(0, item.maxStock);
      if (existingIdx >= 0) {
        const next = [...prev];
        const nq = Math.min(cap, next[existingIdx].qty + qty);
        next[existingIdx] = { ...next[existingIdx], ...item, qty: nq };
        return next;
      }
      return [...prev, { ...item, qty: Math.min(cap, Math.max(1, qty)) }];
    });
  }, []);

  const remove = useCallback((id: string, kind: CartKind) => {
    setItems((prev) => prev.filter((p) => !(p.id === id && p.kind === kind)));
  }, []);

  const updateQty = useCallback((id: string, kind: CartKind, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) => {
          if (p.id !== id || p.kind !== kind) return p;
          const cap = p.maxStock == null ? Infinity : Math.max(0, p.maxStock);
          return { ...p, qty: Math.min(cap, Math.max(1, qty)) };
        })
        .filter((p) => p.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    const totalPrice = items.reduce((s, i) => s + i.qty * Number(i.price || 0), 0);
    const anyRm = items.some((i) => i.priceRm != null && i.priceRm !== 0);
    const totalPriceRm = anyRm
      ? Math.round(items.reduce((s, i) => s + i.qty * Number(i.priceRm || 0), 0) * 100) / 100
      : null;
    return { items, add, remove, updateQty, clear, totalItems, totalPrice, totalPriceRm };
  }, [items, add, remove, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
