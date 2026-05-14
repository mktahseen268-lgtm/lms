import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Zap, ChevronDown } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import { SHIPMENT_STATUSES, EG_PROVINCES, EG_PROVINCES_EN, statusBadge, localizeStatus, localizeProvince } from "../../lib/statuses";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT, useLanguage } from "../../i18n/LanguageContext";

export type Shipment = {
  id: number;
  number: string;
  type: string;
  status: string;
  senderName: string;
  customerName: string;
  customerPhone?: string;
  province: string;
  city?: string;
  cod: number;
  courier?: { id: number; name: string } | null;
  createdAt: string;
};

type Props = {
  titleKey: string;
  subtitleKey?: string;
  scope: "all" | "progress" | "return";
  showQuickFilters?: boolean;
  showBulkActions?: boolean;
};

export default function ShipmentsTable({ titleKey, subtitleKey, scope, showQuickFilters = true, showBulkActions = true }: Props) {
  const t = useT();
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulkOpen, setBulkOpen] = useState(false);

  const BULK_ACTIONS = [
    t("shipments.bulk.assignCourier"),
    t("shipments.bulk.changeStatus"),
    t("shipments.bulk.printLabels"),
    t("shipments.bulk.exportSelected"),
    t("shipments.bulk.cancelSelected"),
  ];

  function load() {
    setLoading(true);
    api
      .get("/shipments", {
        params: {
          scope, page, per_page: perPage,
          search: search || undefined,
          from: from || undefined,
          to: to || undefined,
          provinces: provinces.length ? provinces.join(",") : undefined,
          statuses: statuses.length ? statuses.join(",") : undefined,
        },
      })
      .then((r) => {
        setRows(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [scope, page, perPage]);

  const counts = {
    pending: rows.filter((r) => r.status === "فى انتظار التنفيذ").length,
    delivering: rows.filter((r) => r.status === "تحت تسليم العميل").length,
    delivered: rows.filter((r) => r.status === "تسليم ناجح").length,
  };

  const provinceLabels = lang === "ar" ? EG_PROVINCES : EG_PROVINCES_EN;

  return (
    <>
      <PageHeader
        title={t(titleKey)}
        subtitle={subtitleKey ? t(subtitleKey) : undefined}
        actions={<Link to="/add-shipping-request" className="btn-primary"><PlusCircle size={16} /> {t("dash.addShipment")}</Link>}
      />

      {showQuickFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button className="btn-outline">{t("shipments.qf.pending")}</button>
          <button className="btn-outline">{t("shipments.qf.problems")}</button>
          <button className="btn-outline">{t("shipments.qf.delivered")}</button>
        </div>
      )}

      <div className="card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input md:col-span-2" placeholder={t("shipments.search")} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <MultiSelect placeholder={t("shipments.chooseProvinces")} options={EG_PROVINCES} labels={provinceLabels} value={provinces} onChange={setProvinces} selectedLabel={t("shipments.selected")} />
          <MultiSelect placeholder={t("shipments.chooseStatuses")} options={SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات")} labels={SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات").map((s) => localizeStatus(s, lang))} value={statuses} onChange={setStatuses} selectedLabel={t("shipments.selected")} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={load} className="btn-primary !py-1.5">{t("btn.apply")}</button>
          {showBulkActions && (
            <div className="relative">
              <button onClick={() => setBulkOpen((o) => !o)} className="btn-outline">
                {t("shipments.bulkActions")} <ChevronDown size={14} />
              </button>
              {bulkOpen && (
                <div className="absolute top-full mt-1 end-0 card p-1.5 w-52 z-10">
                  {BULK_ACTIONS.map((a) => (
                    <button key={a} className="w-full text-start px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{a}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <Stat label={t("shipments.stat.pending")} value={counts.pending} color="amber" />
        <Stat label={t("shipments.stat.delivering")} value={counts.delivering} color="sky" />
        <Stat label={t("shipments.stat.delivered")} value={counts.delivered} color="emerald" />
        <Stat label={t("shipments.stat.total")} value={total} color="brand" />
      </div>

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={<Zap size={28} />}
          title={t("shipments.empty.title")}
          description={t("shipments.empty.desc")}
          action={<Link to="/add-shipping-request" className="btn-primary"><PlusCircle size={16} /> {t("dash.addShipment")}</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th w-10"><input type="checkbox" /></th>
                <th className="th">{t("shipments.col.type")}</th>
                <th className="th">{t("shipments.col.number")}</th>
                <th className="th">{t("shipments.col.sender")}</th>
                <th className="th">{t("shipments.col.courier")}</th>
                <th className="th">{t("shipments.col.customer")}</th>
                <th className="th">{t("shipments.col.cod")}</th>
                <th className="th">{t("shipments.col.location")}</th>
                <th className="th">{t("shipments.col.status")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((s) => (
                <tr key={s.id} className="tr">
                  <td className="td">
                    <input type="checkbox" checked={!!selected[s.id]} onChange={(e) => setSelected({ ...selected, [s.id]: e.target.checked })} />
                  </td>
                  <td className="td"><span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{s.type}</span></td>
                  <td className="td font-bold text-brand-800 dark:text-brand-300">{s.number}</td>
                  <td className="td">{s.senderName}</td>
                  <td className="td">{s.courier?.name || <span className="text-slate-400">—</span>}</td>
                  <td className="td">
                    <div>{s.customerName}</div>
                    <div className="text-xs text-slate-500">{s.customerPhone}</div>
                  </td>
                  <td className="td font-semibold">{currency(s.cod)}</td>
                  <td className="td">{localizeProvince(s.province, lang)}{s.city ? ` · ${s.city}` : ""}</td>
                  <td className="td"><span className={"badge " + statusBadge(s.status)}>{localizeStatus(s.status, lang)}</span></td>
                  <td className="td">
                    <button className="text-brand-700 hover:underline text-sm">{t("btn.view")}</button>
                    <span className="mx-1 text-slate-300">|</span>
                    <button className="text-slate-500 hover:underline text-sm">{t("btn.print")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} perPage={perPage} total={total} onPage={setPage} onPerPage={setPerPage} />
        </div>
      )}
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  const map: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
    sky: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
    brand: "bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 flex items-center justify-between ${map[color]}`}>
      <span className="font-medium">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function MultiSelect({
  placeholder, options, labels, value, onChange, selectedLabel,
}: {
  placeholder: string;
  options: string[];
  labels?: string[];
  value: string[];
  onChange: (v: string[]) => void;
  selectedLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="input flex items-center justify-between text-start">
        <span className={value.length ? "" : "text-slate-400"}>
          {value.length ? `${value.length} ${selectedLabel}` : placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto card p-1.5">
          {options.map((o, i) => {
            const sel = value.includes(o);
            return (
              <label key={o} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer text-sm">
                <input type="checkbox" checked={sel} onChange={() => onChange(sel ? value.filter((x) => x !== o) : [...value, o])} />
                <span>{labels?.[i] || o}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
