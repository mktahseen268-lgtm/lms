import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { Search } from "lucide-react";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function DriverAccounting() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ due: 0, owed: 0 });

  useEffect(() => {
    api.get("/accounts/couriers").then((r) => { setRows(r.data.data || []); setSummary(r.data.summary || summary); });
  }, []);

  const filtered = rows.filter((r) => !search || r.name?.includes(search) || r.phone?.includes(search));

  return (
    <>
      <PageHeader title={t("driverAcc.title")} subtitle={t("driverAcc.subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <StatCard tone="green" label={t("sellerAcc.totalDue")} value={currency(summary.due)} />
        <StatCard tone="red" label={t("sellerAcc.totalOwed")} value={currency(summary.owed)} />
      </div>

      <div className="card p-3 mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("driverAcc.search")} />
        </div>
        <span className="text-sm text-slate-500">{filtered.length} {t("driverAcc.count")}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("driverAcc.col.courier")}</th>
              <th className="th">{t("sellerAcc.col.dueTo")}</th>
              <th className="th">{t("sellerAcc.col.dueFrom")}</th>
              <th className="th">{t("sellerAcc.col.net")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="td text-center text-slate-400 py-8">{t("sellerAcc.noData")}</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="tr">
                <td className="td"><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500">{r.phone}</div></td>
                <td className="td text-emerald-600 font-semibold">{currency(r.due)}</td>
                <td className="td text-rose-600 font-semibold">{currency(r.owed)}</td>
                <td className="td font-bold">{currency(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
