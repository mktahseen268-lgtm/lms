import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";

export default function FollowDelegates() {
  const t = useT();
  const [tab, setTab] = useState<"company" | "sinbad">("company");
  return (
    <>
      <PageHeader title={t("follow.title")} subtitle={t("follow.subtitle")} />
      <div className="card p-2 mb-4 flex gap-2">
        <button onClick={() => setTab("company")} className={tab === "company" ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}>{t("follow.companyTab")}</button>
        <button onClick={() => setTab("sinbad")} className={tab === "sinbad" ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}>{t("follow.sinbadTab")}</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("follow.col.shipment")}</th>
              <th className="th">{t("follow.col.sender")}</th>
              <th className="th">{t("follow.col.courier")}</th>
              <th className="th">{t("follow.col.recipient")}</th>
              <th className="th">{t("follow.col.recipientPhone")}</th>
              <th className="th">{t("follow.col.cod")}</th>
              <th className="th">{t("follow.col.shipping")}</th>
              <th className="th">{t("follow.col.extraWeight")}</th>
              <th className="th">{t("follow.col.address")}</th>
              <th className="th">{t("follow.col.image")}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="td" colSpan={10}><EmptyState title={t("empty.title")} /></td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
