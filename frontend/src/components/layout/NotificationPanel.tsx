import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Package, AlertTriangle, Coins, UserPlus, BellOff } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";
import { currency } from "../../lib/format";

type Notification = {
  id: number;
  type: "delivered" | "new" | "cod" | "problem" | "courier";
  titleKey: string;
  descKey: string;
  vars?: Record<string, string | number>;
  createdAt: Date;
  read: boolean;
};

const ICONS = {
  delivered: { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
  new: { Icon: Package, color: "text-brand-700 bg-brand-50 dark:bg-brand-900/30" },
  cod: { Icon: Coins, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
  problem: { Icon: AlertTriangle, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/30" },
  courier: { Icon: UserPlus, color: "text-sky-600 bg-sky-50 dark:bg-sky-900/30" },
};

function seedNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: 1, type: "delivered", titleKey: "notif.shipmentDelivered", descKey: "notif.shipmentDeliveredDesc", vars: { n: "DE-SEED-1003" }, createdAt: new Date(now - 2 * 60_000), read: false },
    { id: 2, type: "cod", titleKey: "notif.codCollected", descKey: "notif.codCollectedDesc", vars: { n: "DE-SEED-1005", amount: currency(450) }, createdAt: new Date(now - 28 * 60_000), read: false },
    { id: 3, type: "problem", titleKey: "notif.deliveryProblem", descKey: "notif.deliveryProblemDesc", vars: { n: "DE-SEED-1008" }, createdAt: new Date(now - 90 * 60_000), read: false },
    { id: 4, type: "new", titleKey: "notif.newShipment", descKey: "notif.newShipmentDesc", vars: { n: "DE-SEED-1012" }, createdAt: new Date(now - 5 * 3600_000), read: true },
    { id: 5, type: "courier", titleKey: "notif.courierJoined", descKey: "notif.courierJoinedDesc", vars: { name: "خالد إبراهيم" }, createdAt: new Date(now - 26 * 3600_000), read: true },
  ];
}

function timeAgo(d: Date, t: (k: string, ...rest: any[]) => string) {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return t("notif.justNow");
  if (m < 60) return t("notif.minutesAgo").replace("{n}", String(m));
  const h = Math.floor(m / 60);
  if (h < 24) return t("notif.hoursAgo").replace("{n}", String(h));
  const days = Math.floor(h / 24);
  return t("notif.daysAgo").replace("{n}", String(days));
}

function interpolate(template: string, vars?: Record<string, any>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export default function NotificationPanel() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(seedNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function markAllRead() {
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  }
  function markOne(id: number) {
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        aria-label="notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -start-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-[360px] max-w-[calc(100vw-1rem)] card p-0 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{t("notif.title")}</h3>
              {unread > 0 && (
                <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  {unread} {t("notif.unread")}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-700 hover:underline">
                {t("notif.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <BellOff size={28} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">{t("notif.empty")}</div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => {
                  const { Icon, color } = ICONS[n.type];
                  return (
                    <li
                      key={n.id}
                      onClick={() => markOne(n.id)}
                      className={
                        "p-3 cursor-pointer transition-colors flex items-start gap-3 " +
                        (n.read ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : "bg-brand-50/30 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20")
                      }
                    >
                      <div className={"h-9 w-9 rounded-full grid place-items-center shrink-0 " + color}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {t(n.titleKey)}
                          </div>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-brand-700 shrink-0" />}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {interpolate(t(n.descKey), n.vars)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt, t)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-2">
            <button className="w-full text-center text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 py-2 rounded-md">
              {t("notif.viewAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
