import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { FileSpreadsheet, FileDown, FileText } from "lucide-react";
import { api } from "../../lib/api";
import { currency, formatDate } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function CompanyWallet() {
  const t = useT();
  const [tab, setTab] = useState<"ops" | "invoices">("ops");
  const [data, setData] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({ search: "", type: "", from: "", to: "" });

  function load() {
    api.get("/accounts/company-wallet", { params: filters }).then((r) => {
      setData(r.data.summary);
      setRows(r.data.transactions);
    });
  }
  useEffect(load, []);

  const summary = data || { total: 0, profit: 0, readyToSupply: 0, net: 0, networkDue: 0 };

  return (
    <>
      <PageHeader
        title={t("wallet.title")}
        subtitle={t("wallet.subtitle")}
        actions={
          <>
            <button className="btn-success"><FileSpreadsheet size={16} /> {t("wallet.exportOps")}</button>
            <button className="btn-outline"><FileDown size={16} /> {t("wallet.exportDues")}</button>
            <button className="btn-primary"><FileText size={16} /> {t("wallet.issueInvoice")}</button>
          </>
        }
      />

      <div className="card p-2 mb-4 flex gap-2">
        <button onClick={() => setTab("ops")} className={tab === "ops" ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}>{t("wallet.opsTab")}</button>
        <button onClick={() => setTab("invoices")} className={tab === "invoices" ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}>{t("wallet.invoicesTab")}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <StatCard tone="purple" label={t("wallet.summary.total")} value={currency(summary.total)} />
        <StatCard tone="green" label={t("wallet.summary.profit")} value={currency(summary.profit)} hint={t("wallet.summary.profitHint")} />
        <StatCard tone="orange" label={t("wallet.summary.ready")} value={currency(summary.readyToSupply)} hint={t("wallet.summary.readyHint")} />
        <StatCard tone="purple" label={t("wallet.summary.net")} value={currency(summary.net)} hint={t("wallet.summary.netHint")} />
        <StatCard tone="orange" label={t("wallet.summary.networkDue")} value={currency(summary.networkDue)} hint={t("wallet.summary.networkDueHint")} />
      </div>

      <div className="card p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="input" placeholder={t("wallet.search")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">{t("wallet.type")}</option>
          <option value="cod">{t("wallet.type.cod")}</option>
          <option value="commission">{t("wallet.type.commission")}</option>
          <option value="payout">{t("wallet.type.payout")}</option>
        </select>
        <input className="input" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input className="input" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <div className="md:col-span-4"><button className="btn-primary !py-1.5" onClick={load}>{t("btn.apply")}</button></div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("wallet.col.opNo")}</th>
              <th className="th">{t("wallet.col.shipmentNo")}</th>
              <th className="th">{t("wallet.col.amount")}</th>
              <th className="th">{t("wallet.col.moveType")}</th>
              <th className="th">{t("wallet.col.payStatus")}</th>
              <th className="th">{t("wallet.col.forEntity")}</th>
              <th className="th">{t("wallet.col.fromEntity")}</th>
              <th className="th">{t("wallet.col.note")}</th>
              <th className="th">{t("wallet.col.date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="td text-center text-slate-400 py-8">{t("wallet.empty")}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="tr">
                <td className="td font-mono">#{r.id}</td>
                <td className="td">{r.shipmentNumber || "—"}</td>
                <td className={"td font-bold " + (r.amount >= 0 ? "text-emerald-600" : "text-rose-600")}>{currency(r.amount)}</td>
                <td className="td">{r.type}</td>
                <td className="td"><span className="badge bg-slate-100 text-slate-700">{r.paymentStatus}</span></td>
                <td className="td">{r.forEntity}</td>
                <td className="td">{r.fromEntity}</td>
                <td className="td">{r.note}</td>
                <td className="td">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
