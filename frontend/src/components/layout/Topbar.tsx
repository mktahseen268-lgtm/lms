import { Globe, Moon, Sun, Menu, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import NotificationPanel from "./NotificationPanel";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { lang, toggle: toggleLang, t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/list-shipping-all?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          aria-label="menu"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <Menu size={20} />
        </button>
        <Logo />
      </div>

      <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3" size={16} />
          <input
            placeholder={t("top.search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input ps-9"
          />
        </div>
      </form>

      <div className="flex items-center gap-1">
        <NotificationPanel />
        <button
          onClick={toggleLang}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-bold"
          aria-label="language"
          title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Globe size={18} />
          <span>{lang === "ar" ? "EN" : "AR"}</span>
        </button>
        <button
          onClick={toggle}
          aria-label="theme"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="h-8 w-8 rounded-full bg-brand-800 text-white grid place-items-center text-sm font-bold">
              {(user?.name || "U").charAt(0)}
            </div>
            <div className="hidden sm:block text-start">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.email}</div>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {profileOpen && (
            <div className="absolute end-0 mt-2 w-48 card p-1.5 z-50">
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="w-full text-start px-3 py-2 text-sm rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-300"
              >
                {t("auth.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
