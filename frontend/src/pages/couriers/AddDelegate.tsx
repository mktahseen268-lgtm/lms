import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Toggle from "../../components/ui/Toggle";
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";
import { EG_PROVINCES, EG_PROVINCES_EN } from "../../lib/statuses";
import { api } from "../../lib/api";
import { useT, useLanguage } from "../../i18n/LanguageContext";

type CommissionRow = { province: string; commissionType: "ratio" | "fixed"; value: number; selected: boolean };

export default function AddDelegate() {
  const t = useT();
  const { lang, dir } = useLanguage();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const [photo, setPhoto] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [rows, setRows] = useState<CommissionRow[]>(
    EG_PROVINCES.map((p) => ({ province: p, commissionType: "fixed", value: 25, selected: false }))
  );

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = [
    t("courier.add.strength.weak"), t("courier.add.strength.weak"),
    t("courier.add.strength.medium"), t("courier.add.strength.strong"), t("courier.add.strength.strong"),
  ][strength];
  const strengthColor = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-500"][strength];

  const NextArrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  async function submit() {
    const selected = rows.filter((r) => r.selected);
    try {
      await api.post("/couriers", {
        name, workType, phone, password,
        active: true,
        commissions: selected.map(({ province, commissionType, value }) => ({ province, commissionType, value })),
      });
      nav("/list-delegates");
    } catch (e: any) {
      alert(e?.response?.data?.error || t("courier.add.saveError"));
    }
  }

  const provinceLabels = lang === "ar" ? EG_PROVINCES : EG_PROVINCES_EN;

  return (
    <>
      <PageHeader title={t("courier.add.title")} subtitle={t("courier.add.subtitle")} />

      <div className="flex items-center gap-3 mb-5">
        <StepBadge n={1} label={t("courier.add.step1")} active={step === 1} done={step === 2} />
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <StepBadge n={2} label={t("courier.add.step2")} active={step === 2} done={false} />
      </div>

      {step === 1 && (
        <div className="card p-5 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">{t("courier.add.photo")}</label>
              <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-brand-400">
                <Upload size={18} className="text-slate-400" />
                <span className="text-sm text-slate-500">{photo ? photo.name : t("courier.add.uploadHint")}</span>
                <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
            </div>
            <Field label={t("courier.add.name")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label={t("courier.add.workType")}>
              <select className="input" value={workType} onChange={(e) => setWorkType(e.target.value)}>
                <option value="">{t("courier.add.workChoose")}</option>
                <option value="دوام كامل">{t("courier.add.workFull")}</option>
                <option value="دوام جزئي">{t("courier.add.workPart")}</option>
                <option value="بالعمولة">{t("courier.add.workComm")}</option>
              </select>
            </Field>
            <Field label={t("courier.add.phone")}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label={t("courier.add.password")}>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="h-1 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{t("courier.add.strength")}: {strengthLabel}</div>
            </Field>
            <Field label={t("courier.add.confirm")}>
              <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {confirm && confirm !== password && <div className="text-xs text-rose-600 mt-1">{t("courier.add.mismatch")}</div>}
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              disabled={!name || !phone || !password || password !== confirm}
              onClick={() => setStep(2)}
              className="btn-primary"
            >
              {t("courier.add.next")} <NextArrow size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-5 max-w-5xl">
          <h3 className="section-title">{t("courier.add.step2")}</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="th w-10"><input type="checkbox" onChange={(e) => setRows((rs) => rs.map((r) => ({ ...r, selected: e.target.checked })))} /></th>
                  <th className="th">{t("courier.add.province")}</th>
                  <th className="th">{t("courier.add.commissionType")}</th>
                  <th className="th">{t("courier.add.value")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((r, i) => (
                  <tr key={r.province} className="tr">
                    <td className="td"><input type="checkbox" checked={r.selected} onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, selected: e.target.checked } : x))} /></td>
                    <td className="td font-medium">{provinceLabels[i]}</td>
                    <td className="td">
                      <select className="input !w-32" value={r.commissionType} onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, commissionType: e.target.value as any } : x))}>
                        <option value="fixed">{t("courier.add.fixed")}</option>
                        <option value="ratio">{t("courier.add.ratio")}</option>
                      </select>
                    </td>
                    <td className="td">
                      <input type="number" className="input !w-32" value={r.value} onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, value: Number(e.target.value) } : x))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(1)} className="btn-outline"><BackArrow size={16} /> {t("btn.back")}</button>
            <button onClick={submit} className="btn-success"><Check size={16} /> {t("courier.add.save")}</button>
          </div>
        </div>
      )}
    </>
  );
}

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={"h-8 w-8 rounded-full grid place-items-center text-sm font-bold " + (active ? "bg-brand-800 text-white" : done ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
        {done ? <Check size={14} /> : n}
      </div>
      <span className={"text-sm " + (active ? "font-bold text-slate-800 dark:text-slate-100" : "text-slate-500")}>{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (<div><label className="label">{label}</label>{children}</div>);
}
