import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { api } from "../../lib/api";
import { currency, formatDate } from "../../lib/format";
import { localizeStatus, localizeProvince, statusBadge, SHIPMENT_STATUSES } from "../../lib/statuses";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { Printer } from "lucide-react";

export default function ShipmentDetailModal({
  shipmentId,
  onClose,
  onChanged,
}: {
  shipmentId: number | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (shipmentId == null) { setData(null); return; }
    api.get(`/shipments/${shipmentId}`).then((r) => setData(r.data.shipment));
  }, [shipmentId]);

  async function changeStatus(s: string) {
    if (!data) return;
    setBusy(true);
    try {
      await api.put(`/shipments/${data.id}`, { status: s });
      const r = await api.get(`/shipments/${data.id}`);
      setData(r.data.shipment);
      toast.success(t("toast.updated"));
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setBusy(false); }
  }

  function printLabel() {
    if (!data) return;
    const w = window.open("", "_blank", "width=420,height=600");
    if (!w) return;
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${data.number}</title>
<style>body{font-family:Cairo,Tahoma;padding:16px}h1{font-size:18px;margin:0 0 8px}.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #ccc;font-size:12px}.barcode{text-align:center;font-family:monospace;font-size:22px;letter-spacing:6px;margin:12px 0;padding:8px;border:2px solid #000}</style>
</head><body>
<h1>Dalilee Logico</h1>
<div class="barcode">*${data.number}*</div>
<div class="row"><b>المرسل:</b><span>${data.senderName || data.client?.name || ""}</span></div>
<div class="row"><b>العميل:</b><span>${data.customerName || ""}</span></div>
<div class="row"><b>الهاتف:</b><span>${data.customerPhone || ""}</span></div>
<div class="row"><b>العنوان:</b><span>${data.customerAddress || ""}</span></div>
<div class="row"><b>المحافظة:</b><span>${data.province || ""}</span></div>
<div class="row"><b>المبلغ COD:</b><span><b>${data.cod} EGP</b></span></div>
<div class="row"><b>الحالة:</b><span>${data.status}</span></div>
<div class="row"><b>تاريخ الإنشاء:</b><span>${new Date(data.createdAt).toLocaleString("ar-EG")}</span></div>
<script>window.print();</script>
</body></html>`);
    w.document.close();
  }

  return (
    <Modal
      open={shipmentId !== null}
      onClose={onClose}
      title={data ? `${t("follow.col.shipment")}: ${data.number}` : t("dash.loading")}
      size="lg"
      footer={
        <>
          <button onClick={printLabel} disabled={!data} className="btn-outline"><Printer size={16} /> {t("btn.print")}</button>
          <button onClick={onClose} className="btn-primary">{t("btn.cancel")}</button>
        </>
      }
    >
      {!data ? (
        <div className="text-center text-slate-400 py-10">{t("dash.loading")}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label={t("shipments.col.type")} value={data.type} />
            <Field label={t("shipments.col.status")} value={
              <span className={"badge " + statusBadge(data.status)}>{localizeStatus(data.status, lang)}</span>
            } />
            <Field label={t("shipments.col.sender")} value={data.senderName || data.client?.name} />
            <Field label={t("shipments.col.courier")} value={data.courier?.name || "—"} />
            <Field label={t("shipments.col.customer")} value={data.customerName} />
            <Field label={t("rts.col.buyerPhone")} value={data.customerPhone || "—"} />
            <Field label={t("shipments.col.location")} value={localizeProvince(data.province, lang) + (data.city ? ` · ${data.city}` : "")} />
            <Field label={t("shipments.col.cod")} value={currency(data.cod)} />
            <Field label={t("rts.col.buyerAddress")} value={data.customerAddress || "—"} className="col-span-2" />
            <Field label={t("couriers.col.created")} value={formatDate(data.createdAt)} className="col-span-2" />
          </div>

          {data.products?.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-2">{t("shipments.add.sec.products")}</h4>
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="th">{t("shipments.add.prodName")}</th>
                      <th className="th">{t("shipments.add.qty")}</th>
                      <th className="th">{t("shipments.add.weight")}</th>
                      <th className="th">{t("shipments.add.fragile")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p: any) => (
                      <tr key={p.id} className="tr border-t border-slate-100 dark:border-slate-800">
                        <td className="td">{p.name}</td>
                        <td className="td">{p.qty}</td>
                        <td className="td">{p.weight} kg</td>
                        <td className="td">{p.fragile ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold text-sm mb-2">{t("shipments.col.status")}</h4>
            <div className="flex flex-wrap gap-2">
              <select
                className="input md:w-72"
                value={data.status}
                disabled={busy}
                onChange={(e) => changeStatus(e.target.value)}
              >
                {SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات").map((s) => (
                  <option key={s} value={s}>{localizeStatus(s, lang)}</option>
                ))}
              </select>
            </div>
          </div>

          {data.statuses?.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-2">History</h4>
              <ul className="space-y-1 text-xs">
                {data.statuses.map((s: any) => (
                  <li key={s.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-1">
                    <span>{localizeStatus(s.status, lang)}</span>
                    <span className="text-slate-500">{formatDate(s.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Field({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
