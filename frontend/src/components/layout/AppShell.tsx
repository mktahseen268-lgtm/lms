import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import clsx from "clsx";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={clsx("transition-all duration-200 pt-4 pb-10 px-4 md:px-6", collapsed ? "ms-16" : "ms-64")}>
        <Outlet />
      </main>
    </div>
  );
}
