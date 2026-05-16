import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Toggle from "../components/ui/Toggle";
import { Save } from "lucide-react";
import { useT } from "../i18n/LanguageContext";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";

export default function ProfileEdit() {
  const t = useT();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", integrationToken: "" });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/profile").then((r) => {
      const c = r.data.company;
      setForm({
        name: c?.name || "",
        email: c?.email || "",
        phone: c?.phone || "",
        address: c?.address || "",
        integrationToken: localStorage.getItem("integrationToken") || "",
      });
      setEmailAlerts(localStorage.getItem("emailAlerts") !== "false");
      setSmsAlerts(localStorage.getItem("smsAlerts") === "true");
    }).finally(() => setLoading(false));
  }, []);

  async function save() {
    setBusy(true);
    try {
      await api.put("/profile", {
        name: form.name, email: form.email, phone: form.phone, address: form.address,
      });
      localStorage.setItem("integrationToken", form.integrationToken);
      localStorage.setItem("emailAlerts", String(emailAlerts));
      localStorage.setItem("smsAlerts", String(smsAlerts));
      toast.success(t("toast.profileSaved"));
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setBusy(false); }
  }

  if (loading) return <div className="card p-10 text-center text-slate-500">{t("dash.loading")}</div>;

  return (
    <>
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">
        <Section title={t("profile.sec.company")} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("profile.companyName")}><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label={t("profile.email")}><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label={t("profile.phone")}><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label={t("profile.address")} className="md:col-span-2"><textarea className="input min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
        </Section>

        <Section title={t("profile.sec.integration")}>
          <Field label={t("profile.apiToken")}><input className="input font-mono" value={form.integrationToken} onChange={(e) => setForm({ ...form, integrationToken: e.target.value })} /></Field>
          <p className="text-xs text-slate-500 mt-2">{t("profile.apiHint")}</p>
        </Section>

        <Section title={t("profile.sec.notifications")} className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle checked={emailAlerts} onChange={setEmailAlerts} label={t("profile.emailAlerts")} hint={t("profile.emailAlertsHint")} />
            <Toggle checked={smsAlerts} onChange={setSmsAlerts} label={t("profile.smsAlerts")} hint={t("profile.smsAlertsHint")} />
          </div>
        </Section>
      </div>

      <div className="mt-5 flex justify-end max-w-5xl">
        <button disabled={busy} onClick={save} className="btn-primary"><Save size={16} /> {busy ? "..." : t("btn.saveChanges")}</button>
      </div>
    </>
  );
}

function Section({ title, children, className = "" }: { title: string; children: any; className?: string }) {
  return (
    <div className={"card p-5 " + className}>
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: any; className?: string }) {
  return (<div className={className}><label className="label">{label}</label>{children}</div>);
}
