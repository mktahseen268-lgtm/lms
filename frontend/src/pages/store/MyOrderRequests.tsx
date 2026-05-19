import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import { currency, formatDate } from "../../lib/format";

type Order = { id: number; status: string; total: number; createdAt: string; items: { name: string; qty: number; price: number }[] };

export default function MyOrderRequests() {
  const t = useT();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/marketplace/orders").then((r) => setOrders(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title={t("myOrders.title")} subtitle={t("myOrders.subtitle")} />
      {loading ? <div className="card p-10 text-center text-slate-500">{t("dash.loading")}</div>
        : orders.length === 0 ? <EmptyState title={t("myOrders.empty")} description={t("myOrders.emptyDesc")} />
        : (
          <div className="table-wrap">
            <table className="table">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="th">#</th>
                  <th className="th">{t("shipments.add.sec.products")}</th>
                  <th className="th">{t("wallet.col.amount")}</th>
                  <th className="th">{t("shipments.col.status")}</th>
                  <th className="th">{t("wallet.col.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="tr">
                    <td className="td font-mono">#{o.id}</td>
                    <td className="td">
                      <ul className="text-xs space-y-0.5">
                        {o.items.map((it, i) => <li key={i}>{it.name} × {it.qty}</li>)}
                      </ul>
                    </td>
                    <td className="td font-bold">{currency(o.total)}</td>
                    <td className="td"><span className="badge bg-amber-100 text-amber-700">{o.status}</span></td>
                    <td className="td">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}
