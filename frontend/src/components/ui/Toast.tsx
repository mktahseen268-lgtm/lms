import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";

type Kind = "success" | "error" | "info" | "warning";
type Toast = { id: number; kind: Kind; message: string };

type Ctx = {
  show: (message: string, kind?: Kind) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
};

const ToastContext = createContext<Ctx>({} as Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, kind: Kind = "info") => {
    const id = ++counter.current;
    setToasts((arr) => [...arr, { id, kind, message }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const value: Ctx = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
    warning: (m) => show(m, "warning"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 end-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

const KIND_STYLE: Record<Kind, { bg: string; icon: any; iconColor: string }> = {
  success: { bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100", icon: CheckCircle2, iconColor: "text-emerald-600" },
  error: { bg: "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-100", icon: AlertTriangle, iconColor: "text-rose-600" },
  warning: { bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100", icon: AlertTriangle, iconColor: "text-amber-600" },
  info: { bg: "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-900 text-sky-900 dark:text-sky-100", icon: Info, iconColor: "text-sky-600" },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { bg, icon: Icon, iconColor } = KIND_STYLE[toast.kind];
  const [leaving, setLeaving] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLeaving(true), 4000); return () => clearTimeout(t); }, []);
  return (
    <div
      className={clsx(
        "flex items-start gap-3 p-3 rounded-lg border shadow-card transition-all duration-300",
        bg,
        leaving ? "opacity-0 translate-y-1" : "opacity-100"
      )}
    >
      <Icon size={18} className={iconColor + " mt-0.5 shrink-0"} />
      <div className="flex-1 text-sm">{toast.message}</div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
