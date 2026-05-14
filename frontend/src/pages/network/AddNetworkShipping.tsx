import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Download, CheckCircle2, Trash2 } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

export default function AddNetworkShipping() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <PageHeader title={t("net.addTitle")} subtitle={t("net.addSubtitle")} />
      <div className="card p-6 max-w-3xl">
        <a href="/templates/network-shipments.xlsx" className="inline-flex items-center gap-1 text-brand-700 hover:underline mb-4">
          <Download size={16} /> {t("net.downloadTpl")}
        </a>

        <label className="block">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-brand-400">
            <div className="text-slate-500 mb-2">{t("btn.uploadFile")}</div>
            <div className="text-sm font-medium text-brand-700">{file?.name || t("btn.chooseFile")}</div>
          </div>
          <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-cyan"><CheckCircle2 size={16} /> {t("net.confirmAdd")}</button>
          <button onClick={() => setFile(null)} className="btn-danger"><Trash2 size={16} /> {t("net.deleteFile")}</button>
        </div>
      </div>
    </>
  );
}
