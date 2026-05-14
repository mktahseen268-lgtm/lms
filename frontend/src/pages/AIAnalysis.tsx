import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { Brain } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { useLanguage, useT } from "../i18n/LanguageContext";

type View = "shipments" | "network";
type Period = "day" | "week" | "30d" | "custom";
type RoleView = "supplier" | "agent";

export default function AIAnalysis() {
  const t = useT();
  const { lang } = useLanguage();
  const [view, setView] = useState<View>("shipments");
  const [period, setPeriod] = useState<Period>("week");
  const [role, setRole] = useState<RoleView>("supplier");

  const successData = [
    { name: lang === "ar" ? "السبت" : "Sat", success: 82 },
    { name: lang === "ar" ? "الأحد" : "Sun", success: 88 },
    { name: lang === "ar" ? "الاثنين" : "Mon", success: 79 },
    { name: lang === "ar" ? "الثلاثاء" : "Tue", success: 91 },
    { name: lang === "ar" ? "الأربعاء" : "Wed", success: 85 },
    { name: lang === "ar" ? "الخميس" : "Thu", success: 93 },
    { name: lang === "ar" ? "الجمعة" : "Fri", success: 76 },
  ];

  const provinceData = lang === "ar"
    ? [{ p: "القاهرة", v: 420 }, { p: "الجيزة", v: 340 }, { p: "الإسكندرية", v: 220 }, { p: "الشرقية", v: 180 }, { p: "الدقهلية", v: 160 }, { p: "أسيوط", v: 140 }]
    : [{ p: "Cairo", v: 420 }, { p: "Giza", v: 340 }, { p: "Alexandria", v: 220 }, { p: "Sharqia", v: 180 }, { p: "Dakahlia", v: 160 }, { p: "Asyut", v: 140 }];

  const courierMix = [
    { name: t("page.ai.statusSuccess"), value: 64, color: "#10B981" },
    { name: t("page.ai.statusReturn"), value: 18, color: "#F59E0B" },
    { name: t("page.ai.statusDelayed"), value: 10, color: "#6366F1" },
    { name: t("page.ai.statusProblem"), value: 8, color: "#EF4444" },
  ];

  return (
    <>
      <PageHeader
        title={t("page.ai.title")}
        subtitle={t("page.ai.subtitle")}
        actions={<div className="badge bg-brand-100 text-brand-800"><Brain size={14} className="me-1" /> Beta</div>}
      />

      <div className="card p-2 mb-4 flex flex-wrap gap-2">
        <Tab active={view === "shipments"} onClick={() => setView("shipments")}>{t("page.ai.shipmentsTab")}</Tab>
        <Tab active={view === "network"} onClick={() => setView("network")}>{t("page.ai.networkTab")}</Tab>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(["day", "week", "30d", "custom"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={period === p ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}
          >
            {p === "day" ? t("page.ai.today") : p === "week" ? t("page.ai.week") : p === "30d" ? t("page.ai.30days") : t("page.ai.custom")}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">{t("page.ai.role")}</span>
          <select className="input !w-auto !py-1.5" value={role} onChange={(e) => setRole(e.target.value as RoleView)}>
            <option value="supplier">{t("page.ai.asSupplier")}</option>
            <option value="agent">{t("page.ai.asAgent")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <h3 className="section-title">{t("page.ai.successRate")}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={successData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" reversed={lang === "ar"} />
                <YAxis orientation={lang === "ar" ? "right" : "left"} />
                <Tooltip />
                <Line type="monotone" dataKey="success" stroke="#6B21A8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="section-title">{t("page.ai.statusMix")}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={courierMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {courierMix.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 lg:col-span-3">
          <h3 className="section-title">{t("page.ai.provincePerf")}</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={provinceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="p" reversed={lang === "ar"} />
                <YAxis orientation={lang === "ar" ? "right" : "left"} />
                <Tooltip />
                <Bar dataKey="v" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function Tab({ active, children, onClick }: { active: boolean; children: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className={"px-4 py-2 rounded-lg text-sm font-semibold " + (active ? "bg-brand-800 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800")}>
      {children}
    </button>
  );
}
