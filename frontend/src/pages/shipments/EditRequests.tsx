import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { Edit3, Search } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

export default function EditRequests() {
  const t = useT();
  return (
    <>
      <PageHeader title={t("editReq.title")} subtitle={t("editReq.subtitle")} />
      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="input ps-9" placeholder={t("editReq.searchPh")} />
        </div>
      </div>
      <EmptyState icon={<Edit3 size={28} />} title={t("editReq.empty")} description={t("editReq.emptyDesc")} />
    </>
  );
}
