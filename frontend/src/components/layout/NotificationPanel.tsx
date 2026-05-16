import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Package, AlertTriangle, Coins, UserPlus, BellOff } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";
import { currency } from "../../lib/format";
import { api } from "../../lib/api";

type Notification = {
  id: string;
  type: "delivered" | "new" | "cod" | "problem" | "courier";
  titleKey: string;
  descKey: string;
  vars?: Record<string, string | number>;
  createdAt: string;
  read: boolean;
};

const ICONS: Record<string, { Icon: any; color: string }> = {
  delivered: { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" },
  new: { Icon: Package, color: "text-brand-700 bg-brand-50 dark:bg-brand-900/30" },
  cod: { Icon: Coins, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
  problem: { Icon: AlertTriangle, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/30" },
  courier: { Icon: UserPlus, color: "text-sky-600 bg-sky-50 dark:bg-sky-900/30" },
};

function timeAgo(d: string, t: (k: string) => string) {
  const diff = Date.now() - new Date(d).getTime();
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
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    if (k === "amount" && typeof v === "number") return currency(v);
    return String(v ?? "");
  });
}

const READ_KEY = "notif.read";
function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); } catch { return new Set(); }
}
function persistReadIds(s: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...s]));
}

export default function NotificationPanel() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    setLoading(true);
    const readSet = getReadIds();
    api.get("/notifications").then((r) => {
      const data: Notification[] = (r.data.data || []).map((n: Notification) => ({ ...n, read: readSet.has(n.id) }));
      setItems(data);
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

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
    const s = getReadIds();
    items.forEach((n) => s.add(n.id));
    persistReadIds(s);
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  }
  function markOne(id: string) {
    const s = getReadIds();
    s.add(id);
    persistReadIds(s);
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
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
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">{t("dash.loading")}</div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <BellOff size={28} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">{t("notif.empty")}</div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => {
                  const meta = ICONS[n.type] || ICONS.new;
                  const { Icon, color } = meta;
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
        </div>
      )}
    </div>
  );
}
