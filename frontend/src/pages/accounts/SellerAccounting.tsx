import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function SellerAccounting() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ due: 0, owed: 0, networkPending: 0 });

  useEffect(() => {
    api.get("/accounts/sellers").then((r) => { setRows(r.data.data || []); setSummary(r.data.summary || summary); });
  }, []);

  const filtered = rows.filter((r) => !search || r.name?.includes(search) || r.email?.includes(search) || r.phone?.includes(search));

  return (
    <>
      <PageHeader title={t("sellerAcc.title")} subtitle={t("sellerAcc.subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <StatCard tone="green" label={t("sellerAcc.totalDue")} value={currency(summary.due)} />
        <StatCard tone="red" label={t("sellerAcc.totalOwed")} value={currency(summary.owed)} />
        <StatCard tone="orange" label={t("sellerAcc.networkPending")} value={currency(summary.networkPending)} />
      </div>

      <div className="card p-3 mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("sellerAcc.search")} />
        </div>
        <span className="text-sm text-slate-500">{filtered.length} {t("sellerAcc.count")}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("sellerAcc.col.client")}</th>
              <th className="th">{t("sellerAcc.col.dueTo")}</th>
              <th className="th">{t("sellerAcc.col.dueFrom")}</th>
              <th className="th">{t("sellerAcc.col.network")}</th>
              <th className="th">{t("sellerAcc.col.net")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="td text-center text-slate-400 py-8">{t("sellerAcc.noData")}</td></tr>
            ) : filtered.map((r: any) => (
              <tr key={r.id} className="tr">
                <td className="td">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.phone}</div>
                </td>
                <td className="td text-emerald-600 font-semibold">{currency(r.due)}</td>
                <td className="td text-rose-600 font-semibold">{currency(r.owed)}</td>
                <td className="td text-amber-600">{currency(r.networkPending)}</td>
                <td className="td font-bold">{currency(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
