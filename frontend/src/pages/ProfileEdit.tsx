import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Toggle from "../components/ui/Toggle";
import { Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/LanguageContext";

export default function ProfileEdit() {
  const t = useT();
  const { user } = useAuth();
  const [name, setName] = useState(user?.company?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [integrationToken, setIntegrationToken] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <>
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">
        <Section title={t("profile.sec.company")} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("profile.companyName")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label={t("profile.email")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label={t("profile.phone")}><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label={t("profile.address")} className="md:col-span-2"><textarea className="input min-h-[80px]" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          </div>
        </Section>

        <Section title={t("profile.sec.integration")}>
          <Field label={t("profile.apiToken")}><input className="input font-mono" value={integrationToken} onChange={(e) => setIntegrationToken(e.target.value)} /></Field>
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
        <button className="btn-primary"><Save size={16} /> {t("btn.saveChanges")}</button>
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
