import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { ClipboardPaste, Search, X } from "lucide-react";
import { api } from "../../lib/api";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { localizeStatus } from "../../lib/statuses";

export default function CheckOrders() {
  const t = useT();
  const { lang } = useLanguage();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ found: any[]; missing: string[] } | null>(null);

  const numbers = text.split(/\s+/).map((x) => x.trim()).filter(Boolean);
  const count = numbers.length;

  async function paste() {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(text + (text ? "\n" : "") + clipText.trim());
    } catch {}
  }
  function clear() { setText(""); setResult(null); }

  async function check() {
    setBusy(true);
    try {
      const r = await api.post("/shipments/check", { numbers });
      setResult(r.data);
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={t("check.title")} subtitle={t("check.subtitle")} />
      <div className="card p-5 max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">{t("check.enter")}</h2>
          <span className="text-sm text-slate-500">1000 / {count}</span>
        </div>
        <button onClick={paste} className="btn-outline mb-3"><ClipboardPaste size={16} /> {t("check.paste")}</button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[200px] font-mono"
          placeholder={t("check.placeholder")}
        />
        <div className="flex items-center gap-2 mt-3">
          <button disabled={busy || count === 0} onClick={check} className="btn-primary"><Search size={16} /> {t("check.runCheck")}</button>
          <button onClick={clear} className="btn-outline"><X size={16} /> {t("check.clear")}</button>
        </div>
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-4 mt-5 max-w-3xl">
          <div className="card p-4">
            <h3 className="font-bold mb-3 text-emerald-700">{t("check.found")} ({result.found.length})</h3>
            <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
              {result.found.map((s: any) => (
                <li key={s.number} className="flex justify-between">
                  <span className="font-mono">{s.number}</span>
                  <span className="text-slate-500">{localizeStatus(s.status, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <h3 className="font-bold mb-3 text-rose-700">{t("check.missing")} ({result.missing.length})</h3>
            <ul className="space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
              {result.missing.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
