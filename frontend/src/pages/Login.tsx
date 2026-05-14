import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import Logo from "../components/layout/Logo";
import { useT } from "../i18n/LanguageContext";

export default function Login() {
  const { login, token } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("admin@dalilee.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  if (token) return <Navigate to="/dashboard" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.error || t("auth.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-to-br from-brand-800 to-brand-950 text-white p-12 flex-col justify-between">
        <Logo />
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">{t("auth.heroTitle")}</h2>
          <p className="text-brand-100 text-lg max-w-md">{t("auth.heroDesc")}</p>
          <ul className="mt-8 space-y-2 text-sm text-brand-100">
            <li>• {t("auth.feat1")}</li>
            <li>• {t("auth.feat2")}</li>
            <li>• {t("auth.feat3")}</li>
            <li>• {t("auth.feat4")}</li>
          </ul>
        </div>
        <p className="text-xs text-brand-200">© Dalilee Logico · Powered by Dalilee</p>
      </div>

      <div className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-md card p-8">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{t("auth.signIn")}</h1>
          <p className="text-sm text-slate-500 mb-6">{t("auth.signInSubtitle")}</p>

          <div className="mb-3">
            <label className="label">{t("auth.email")}</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="mb-3">
            <label className="label">{t("auth.password")}</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          {err && <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2 mb-3">{err}</div>}

          <button disabled={busy} className="btn-primary w-full">{busy ? t("auth.signingIn") : t("auth.login")}</button>

          <p className="text-xs text-slate-400 mt-4 text-center">{t("auth.defaultAccount")}</p>
        </form>
      </div>
    </div>
  );
}
