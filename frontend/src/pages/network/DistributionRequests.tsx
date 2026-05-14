import PageHeader from "../../components/ui/PageHeader";
import { useT } from "../../i18n/LanguageContext";

export default function DistributionRequests() {
  const t = useT();
  return (
    <>
      <PageHeader title={t("distReq.title")} subtitle={t("distReq.subtitle")} />
      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("distReq.col.applicant")}</th>
              <th className="th">{t("distReq.col.targetProvince")}</th>
              <th className="th">{t("distReq.col.status")}</th>
              <th className="th">{t("shipments.col.actions")}</th>
            </tr>
          </thead>
          <tbody><tr><td colSpan={4} className="td text-center text-slate-400 py-8">{t("distReq.empty")}</td></tr></tbody>
        </table>
      </div>
    </>
  );
}
