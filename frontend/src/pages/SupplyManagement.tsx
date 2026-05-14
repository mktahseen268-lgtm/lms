import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../lib/api";
import { useT } from "../i18n/LanguageContext";

export default function SupplyManagement() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/supply").then((r) => setRows(r.data.data || [])).catch(() => {}); }, []);

  return (
    <>
      <PageHeader title={t("supply.title")} subtitle={t("supply.subtitle")} />
      {rows.length === 0 ? (
        <EmptyState title={t("supply.empty")} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr><th className="th">{t("supply.col.province")}</th><th className="th">{t("supply.col.distributor")}</th><th className="th">{t("shipments.col.actions")}</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <tr key={i} className="tr">
                  <td className="td font-semibold">{r.province}</td>
                  <td className="td">{r.distributor}</td>
                  <td className="td"><button className="text-brand-700 text-sm">{t("btn.edit")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
