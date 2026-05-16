import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  destructive = false,
  busy = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  destructive?: boolean;
  busy?: boolean;
}) {
  const t = useT();
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onCancel} className="btn-outline">{t("btn.cancel")}</button>
          <button onClick={onConfirm} disabled={busy} className={destructive ? "btn-danger" : "btn-primary"}>
            {busy ? "..." : t("btn.confirm")}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {destructive && (
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 grid place-items-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
    </Modal>
  );
}
