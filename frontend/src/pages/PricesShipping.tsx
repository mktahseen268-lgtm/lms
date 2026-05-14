import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Toggle from "../components/ui/Toggle";
import { Save, Settings2, Search } from "lucide-react";
import { api } from "../lib/api";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { EG_PROVINCES, EG_PROVINCES_EN } from "../lib/statuses";

type Row = {
  id?: number;
  province: string;
  basePrice: number;
  returnPrice: number;
  weightPrice: number;
  deliveryPrice: number;
  active: boolean;
};

export default function PricesShipping() {
  const t = useT();
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkValues, setBulkValues] = useState({ basePrice: "", returnPrice: "", weightPrice: "", deliveryPrice: "" });

  useEffect(() => {
    api.get("/pricing/provinces").then((r) => setRows(r.data.data || []));
  }, []);

  const filtered = rows
    .filter((r) => (tab === "all" ? true : tab === "active" ? r.active : !r.active))
    .filter((r) => !search || r.province.includes(search) ||
      (lang === "en" && EG_PROVINCES_EN[EG_PROVINCES.indexOf(r.province)]?.toLowerCase().includes(search.toLowerCase())));

  const counts = {
    total: rows.length,
    active: rows.filter((r) => r.active).length,
    inactive: rows.filter((r) => !r.active).length,
  };

  function update(i: number, p: Partial<Row>) {
    setRows((arr) => arr.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  async function save() {
    await api.put("/pricing/bulk-update", { rows });
    alert(t("pricing.saved"));
  }

  function applyBulk() {
    const upd: Partial<Row> = {};
    if (bulkValues.basePrice) upd.basePrice = Number(bulkValues.basePrice);
    if (bulkValues.returnPrice) upd.returnPrice = Number(bulkValues.returnPrice);
    if (bulkValues.weightPrice) upd.weightPrice = Number(bulkValues.weightPrice);
    if (bulkValues.deliveryPrice) upd.deliveryPrice = Number(bulkValues.deliveryPrice);
    setRows((arr) => arr.map((r) => (selectAll || selected[r.province] ? { ...r, ...upd } : r)));
    setBulkOpen(false);
  }

  function provinceLabel(p: string) {
    if (lang === "en") {
      const i = EG_PROVINCES.indexOf(p);
      return i >= 0 ? EG_PROVINCES_EN[i] : p;
    }
    return p;
  }

  return (
    <>
      <PageHeader
        title={t("pricing.title")}
        subtitle={t("pricing.subtitle")}
        actions={
          <>
            <button onClick={save} className="btn-primary"><Save size={16} /> {t("pricing.save")}</button>
            <button onClick={() => setBulkOpen(true)} className="btn-outline"><Settings2 size={16} /> {t("pricing.bulkEdit")}</button>
          </>
        }
      />

      <div className="card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {(["all", "active", "inactive"] as const).map((tt) => (
            <button key={tt} onClick={() => setTab(tt)} className={tab === tt ? "btn-primary !py-1.5" : "btn-outline !py-1.5"}>
              {tt === "all" ? t("pricing.tab.all") : tt === "active" ? t("pricing.tab.active") : t("pricing.tab.inactive")}
            </button>
          ))}
          <div className="text-sm text-slate-500 ms-3">
            {t("pricing.totals.total")}: <span className="font-bold">{counts.total}</span> · {t("pricing.totals.active")}: <span className="font-bold text-emerald-600">{counts.active}</span> · {t("pricing.totals.inactive")}: <span className="font-bold text-rose-600">{counts.inactive}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} /> {t("pricing.selectAll")}
          </label>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="input ps-9" placeholder={t("pricing.searchPh")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th w-10"></th>
              <th className="th">{t("pricing.col.province")}</th>
              <th className="th">{t("pricing.col.base")}</th>
              <th className="th">{t("pricing.col.return")}</th>
              <th className="th">{t("pricing.col.weight")}</th>
              <th className="th">{t("pricing.col.delivery")}</th>
              <th className="th">{t("pricing.col.active")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((r) => {
              const idx = rows.indexOf(r);
              return (
                <tr key={r.province} className="tr">
                  <td className="td"><input type="checkbox" checked={!!selected[r.province] || selectAll} onChange={(e) => setSelected({ ...selected, [r.province]: e.target.checked })} /></td>
                  <td className="td font-semibold">{provinceLabel(r.province)}</td>
                  <td className="td"><input type="number" className="input !w-24" value={r.basePrice} onChange={(e) => update(idx, { basePrice: Number(e.target.value) })} /></td>
                  <td className="td"><input type="number" className="input !w-24" value={r.returnPrice} onChange={(e) => update(idx, { returnPrice: Number(e.target.value) })} /></td>
                  <td className="td"><input type="number" className="input !w-24" value={r.weightPrice} onChange={(e) => update(idx, { weightPrice: Number(e.target.value) })} /></td>
                  <td className="td"><input type="number" className="input !w-24" value={r.deliveryPrice} onChange={(e) => update(idx, { deliveryPrice: Number(e.target.value) })} /></td>
                  <td className="td"><Toggle checked={r.active} onChange={(v) => update(idx, { active: v })} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {bulkOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setBulkOpen(false)}>
          <div className="card p-5 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-title">{t("pricing.bulk.modalTitle")}</h3>
            <p className="text-sm text-slate-500 mb-3">{t("pricing.bulk.modalDesc")}</p>
            <div className="grid grid-cols-2 gap-3">
              {(["basePrice", "returnPrice", "weightPrice", "deliveryPrice"] as const).map((k) => (
                <div key={k}>
                  <label className="label">{k === "basePrice" ? t("pricing.field.base") : k === "returnPrice" ? t("pricing.col.return") : k === "weightPrice" ? t("pricing.col.weight") : t("pricing.col.delivery")}</label>
                  <input type="number" className="input" value={bulkValues[k]} onChange={(e) => setBulkValues({ ...bulkValues, [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setBulkOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
              <button onClick={applyBulk} className="btn-primary">{t("btn.apply")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
