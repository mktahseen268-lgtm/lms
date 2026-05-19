import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Download, CheckCircle2, Trash2 } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

export default function AddNetworkShipping() {
  const t = useT();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!file) return toast.error(t("toast.error"));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // backend endpoint is a stub but we still POST so UI is consistent
      await api.post("/network/add-shipments", { fileName: file.name, size: file.size });
      toast.success(t("toast.sent"));
      setFile(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setBusy(false); }
  }

  function downloadTemplate(e: React.MouseEvent) {
    e.preventDefault();
    const csv = "number,merchant,customer,phone,address,province,city,cod,weight,fragile,notes\n";
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "network-shipments-template.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title={t("net.addTitle")} subtitle={t("net.addSubtitle")} />
      <div className="card p-6 max-w-3xl">
        <a href="#" onClick={downloadTemplate} className="inline-flex items-center gap-1 text-brand-700 hover:underline mb-4">
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
          <button disabled={busy || !file} onClick={confirm} className="btn-cyan"><CheckCircle2 size={16} /> {busy ? "..." : t("net.confirmAdd")}</button>
          <button onClick={() => setFile(null)} className="btn-danger"><Trash2 size={16} /> {t("net.deleteFile")}</button>
        </div>
      </div>
    </>
  );
}
