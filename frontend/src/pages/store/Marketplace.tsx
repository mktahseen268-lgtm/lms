import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import { Package, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";

type Product = { id: number; name: string; price: number; description?: string; image?: string };
type CartItem = { id: number; name: string; price: number; qty: number };

export default function Marketplace() {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("mkt.cart") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/marketplace/products").then((r) => setItems(r.data.data || [])); }, []);
  useEffect(() => { localStorage.setItem("mkt.cart", JSON.stringify(cart)); }, [cart]);

  function add(p: Product) {
    setCart((c) => {
      const ex = c.find((x) => x.id === p.id);
      return ex ? c.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    toast.success(t("toast.cartItemAdded"));
  }
  function changeQty(id: number, delta: number) {
    setCart((c) => c.map((x) => x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  }
  function remove(id: number) { setCart((c) => c.filter((x) => x.id !== id)); }

  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  async function checkout() {
    if (!cart.length) return;
    setBusy(true);
    try {
      await api.post("/marketplace/orders", { items: cart, total });
      toast.success(t("toast.orderPlaced"));
      setCart([]); setCartOpen(false);
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader
        title={t("market.title")}
        subtitle={t("market.subtitle")}
        actions={
          <button onClick={() => setCartOpen(true)} className="btn-outline relative">
            <ShoppingCart size={16} /> {currency(total)}
            {cartCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-xs font-bold grid place-items-center">{cartCount}</span>
            )}
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            <div className="h-40 bg-slate-100 dark:bg-slate-800 grid place-items-center">
              {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Package size={40} className="text-slate-300" />}
            </div>
            <div className="p-3">
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">{p.description}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-brand-800 dark:text-brand-300">{currency(p.price)}</span>
                <button onClick={() => add(p)} className="btn-primary !py-1.5 !px-3 text-xs"><ShoppingCart size={14} /> {t("market.addToCart")}</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12">{t("market.empty")}</div>
        )}
      </div>

      <Modal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title={t("market.title")}
        size="lg"
        footer={
          <>
            <div className="me-auto font-bold">{t("page.total")}: {currency(total)}</div>
            <button onClick={() => setCartOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !cart.length} onClick={checkout} className="btn-primary">{busy ? "..." : t("btn.confirm")}</button>
          </>
        }
      >
        {cart.length === 0 ? (
          <div className="text-center text-slate-400 py-10">{t("market.empty")}</div>
        ) : (
          <div className="space-y-2">
            {cart.map((x) => (
              <div key={x.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{x.name}</div>
                  <div className="text-xs text-slate-500">{currency(x.price)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQty(x.id, -1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Minus size={14} /></button>
                  <span className="w-8 text-center font-semibold">{x.qty}</span>
                  <button onClick={() => changeQty(x.id, 1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Plus size={14} /></button>
                </div>
                <div className="w-24 text-end font-bold">{currency(x.price * x.qty)}</div>
                <button onClick={() => remove(x.id)} className="text-rose-600 p-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
