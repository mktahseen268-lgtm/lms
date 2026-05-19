import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileSpreadsheet, PlusCircle, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Toggle from "../../components/ui/Toggle";
import { api } from "../../lib/api";
import { EG_PROVINCES } from "../../lib/statuses";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";

type Product = { name: string; qty: number; weight: number; fragile: boolean };

const EN_PROVINCES = [
  "Cairo","Giza","Alexandria","Dakahlia","Sharqia","Qalyubia","Monufia","Gharbia",
  "Kafr el-Sheikh","Beheira","Ismailia","Suez","Port Said","Damietta","North Sinai","South Sinai",
  "Faiyum","Beni Suef","Minya","Asyut","Sohag","Qena","Luxor","Aswan","Red Sea","New Valley","Matrouh","Helwan","6th of October",
];

export default function AddShipping() {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const nav = useNavigate();
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const [type, setType] = useState("جديد");
  const [clientId, setClientId] = useState<number | "">("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneAlt, setPhoneAlt] = useState("");
  const [address, setAddress] = useState("");

  const [prepaid, setPrepaid] = useState(false);
  const [cod, setCod] = useState<number | "">("");

  const [products, setProducts] = useState<Product[]>([{ name: "", qty: 1, weight: 0.5, fragile: false }]);

  const [extraOpen, setExtraOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [allowOpen, setAllowOpen] = useState(false);

  useEffect(() => {
    api.get("/clients").then((r) => setClients(r.data.data || [])).catch(() => {});
  }, []);

  function setProduct(i: number, p: Partial<Product>) {
    setProducts((arr) => arr.map((row, idx) => (idx === i ? { ...row, ...p } : row)));
  }
  function addProduct() { setProducts((arr) => [...arr, { name: "", qty: 1, weight: 0.5, fragile: false }]); }
  function removeProduct(i: number) { setProducts((arr) => arr.filter((_, idx) => idx !== i)); }

  async function submit() {
    setBusy(true);
    try {
      await api.post("/shipments", {
        type, clientId, province, city,
        customerName, phone, phoneAlt, address,
        prepaid, codAmount: Number(cod || 0),
        products, barcode, notes, allowOpen,
      });
      toast.success(t("toast.saved"));
      nav("/list-shipping-all");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("shipments.add.saveError"));
    } finally {
      setBusy(false);
    }
  }

  const provinceList = lang === "ar" ? EG_PROVINCES : EN_PROVINCES;

  return (
    <>
      <PageHeader
        title={t("shipments.add.title")}
        subtitle={t("shipments.add.subtitle")}
        actions={<Link to="/list-shipping-all" className="btn-outline"><FileSpreadsheet size={16} /> {t("shipments.add.bulkExcel")}</Link>}
      />

      <div className="space-y-4 max-w-5xl">
        <Section title={t("shipments.add.sec.route")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("shipments.add.type")}>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="جديد">{t("shipments.type.new")}</option>
                <option value="استبدال">{t("shipments.type.replace")}</option>
                <option value="استرجاع">{t("shipments.type.return")}</option>
                <option value="توصيل">{t("shipments.type.delivery")}</option>
              </select>
            </Field>
            <Field label={t("shipments.add.merchant")}>
              <select className="input" value={clientId} onChange={(e) => setClientId(Number(e.target.value) || "")}>
                <option value="">{t("shipments.add.chooseMerchant")}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label={t("shipments.add.province")}>
              <select className="input" value={province} onChange={(e) => setProvince(e.target.value)}>
                <option value="">{t("shipments.add.chooseProvince")}</option>
                {provinceList.map((p, i) => <option key={p} value={EG_PROVINCES[i]}>{p}</option>)}
              </select>
            </Field>
            <Field label={t("shipments.add.city")}>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("shipments.add.cityPh")} />
            </Field>
          </div>
        </Section>

        <Section title={t("shipments.add.sec.customer")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("shipments.add.customerName")}>
              <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("shipments.add.fullName")} />
            </Field>
            <Field label={t("shipments.add.phone")}>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
            </Field>
            <Field label={t("shipments.add.phoneAlt")}>
              <input className="input" value={phoneAlt} onChange={(e) => setPhoneAlt(e.target.value)} placeholder="01xxxxxxxxx" />
            </Field>
            <Field label={t("shipments.add.address")} className="md:col-span-2">
              <textarea className="input min-h-[80px]" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("shipments.add.addressPh")} />
            </Field>
          </div>
        </Section>

        <Section title={t("shipments.add.sec.payment")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Toggle checked={prepaid} onChange={setPrepaid} label={t("shipments.add.prepaid")} hint={t("shipments.add.prepaidHint")} />
            <Field label={t("shipments.add.cod")}>
              <input className="input" type="number" value={cod} onChange={(e) => setCod(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("shipments.add.codPh")} />
            </Field>
          </div>
        </Section>

        <Section title={t("shipments.add.sec.products")}>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="th">{t("shipments.add.prodName")}</th>
                  <th className="th w-28">{t("shipments.add.qty")}</th>
                  <th className="th w-32">{t("shipments.add.weight")}</th>
                  <th className="th w-32">{t("shipments.add.fragile")}</th>
                  <th className="th w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p, i) => (
                  <tr key={i} className="tr">
                    <td className="td"><input className="input" value={p.name} onChange={(e) => setProduct(i, { name: e.target.value })} /></td>
                    <td className="td"><input className="input" type="number" min={1} value={p.qty} onChange={(e) => setProduct(i, { qty: Number(e.target.value) })} /></td>
                    <td className="td"><input className="input" type="number" step="0.1" value={p.weight} onChange={(e) => setProduct(i, { weight: Number(e.target.value) })} /></td>
                    <td className="td"><Toggle checked={p.fragile} onChange={(v) => setProduct(i, { fragile: v })} /></td>
                    <td className="td">
                      {products.length > 1 && (
                        <button onClick={() => removeProduct(i)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-md"><Trash2 size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addProduct} className="btn-outline mt-3"><PlusCircle size={16} /> {t("shipments.add.addProduct")}</button>
        </Section>

        <div className="card">
          <button onClick={() => setExtraOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-start">
            <h3 className="section-title !mb-0">{t("shipments.add.sec.extra")}</h3>
            {extraOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {extraOpen && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t("shipments.add.barcode")}><input className="input" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={t("shipments.add.barcodePh")} /></Field>
              <Field label={t("shipments.add.notes")}><textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("shipments.add.notesPh")} /></Field>
              <Toggle checked={allowOpen} onChange={setAllowOpen} label={t("shipments.add.allowOpen")} hint={t("shipments.add.allowOpenHint")} />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1"><Info size={14} /> {t("shipments.add.verifyHint")}</div>
          <button disabled={busy} onClick={submit} className="btn-primary">{busy ? t("shipments.add.saving") : t("shipments.add.submit")}</button>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="card p-4 md:p-5">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: any; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
