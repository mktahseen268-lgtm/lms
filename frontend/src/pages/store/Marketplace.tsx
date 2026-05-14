import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Package, ShoppingCart } from "lucide-react";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function Marketplace() {
  const t = useT();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.get("/marketplace/products").then((r) => setItems(r.data.data || [])); }, []);

  return (
    <>
      <PageHeader title={t("market.title")} subtitle={t("market.subtitle")} />
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
                <button className="btn-primary !py-1.5 !px-3 text-xs"><ShoppingCart size={14} /> {t("market.addToCart")}</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12">{t("market.empty")}</div>
        )}
      </div>
    </>
  );
}
