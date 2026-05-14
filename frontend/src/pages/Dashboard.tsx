import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
import { currency } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

type Kpis = {
  shipments: { total: number; pending: number; inProgress: number; delivered: number; problems: number };
  cod: { total: number; collected: number };
  couriers: { active: number };
  clients: { active: number };
};

export default function Dashboard() {
  const { t, dir } = useLanguage();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard").then((r) => setKpis(r.data)).finally(() => setLoading(false));
  }, []);

  const isEmpty = !loading && (!kpis || kpis.shipments.total === 0);
  const hasData = !loading && kpis && kpis.shipments.total > 0;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader
        title={t("nav.dashboard")}
        subtitle={t("dash.subtitle")}
        actions={
          <Link to="/add-shipping-request" className="btn-primary">
            <PlusCircle size={16} /> {t("dash.addShipment")}
          </Link>
        }
      />

      {loading ? (
        <div className="card p-10 text-center text-slate-500">{t("dash.loading")}</div>
      ) : isEmpty ? (
        <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-950">
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-900 dark:text-white">{t("dash.startNow")}</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto">{t("dash.startDesc")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            {[
              { n: "1", t: t("dash.step1Title"), d: t("dash.step1Desc") },
              { n: "2", t: t("dash.step2Title"), d: t("dash.step2Desc") },
              { n: "3", t: t("dash.step3Title"), d: t("dash.step3Desc") },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-brand-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <div className="h-10 w-10 rounded-full bg-brand-800 text-white grid place-items-center font-bold mx-auto mb-3">{s.n}</div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{s.t}</div>
                <p className="text-xs text-slate-500 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
          <Link to="/add-shipping-request" className="btn-primary mt-8 inline-flex">
            {t("dash.addFirst")} <Arrow size={16} />
          </Link>
        </div>
      ) : hasData && kpis ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard tone="purple" label={t("dash.kpi.total")} value={kpis.shipments.total} icon={<Package size={20} />} />
            <StatCard tone="orange" label={t("dash.kpi.inProgress")} value={kpis.shipments.inProgress} icon={<Truck size={20} />} />
            <StatCard tone="green" label={t("dash.kpi.delivered")} value={kpis.shipments.delivered} icon={<CheckCircle2 size={20} />} />
            <StatCard tone="red" label={t("dash.kpi.problems")} value={kpis.shipments.problems} icon={<AlertTriangle size={20} />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <StatCard tone="blue" label={t("dash.kpi.codTotal")} value={currency(kpis.cod.total)} />
            <StatCard tone="green" label={t("dash.kpi.codCollected")} value={currency(kpis.cod.collected)} />
            <StatCard tone="slate" label={t("dash.kpi.activeCouriers")} value={kpis.couriers.active} />
          </div>
        </>
      ) : null}
    </>
  );
}
