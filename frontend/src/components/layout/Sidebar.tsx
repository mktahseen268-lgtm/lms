import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Brain, Package, PlusCircle, ListChecks, Edit3, RotateCcw, Search,
  Users, UserPlus, FileText, Eye, Send, Wallet, Coins, ReceiptText, ScanBarcode,
  CircleDollarSign, BarChart3, Boxes, Truck, Store, Network, Building2,
  ShoppingBag, Cog, ChevronDown
} from "lucide-react";
import clsx from "clsx";
import { useT } from "../../i18n/LanguageContext";
import type { TKey } from "../../i18n/translations";

type Item = { key: TKey; to?: string; icon?: any; children?: Item[] };

const NAV: Item[] = [
  { key: "nav.dashboard", to: "/dashboard", icon: LayoutDashboard },
  { key: "nav.ai", to: "/ai-analysis", icon: Brain },
  {
    key: "nav.shipments", icon: Package, children: [
      { key: "nav.addShipment", to: "/add-shipping-request", icon: PlusCircle },
      { key: "nav.allShipments", to: "/list-shipping-all", icon: ListChecks },
      { key: "nav.progressShipments", to: "/list-shipping-progress", icon: Truck },
      { key: "nav.editRequests", to: "/edit-shipping-request", icon: Edit3 },
      { key: "nav.returnShipments", to: "/list-shipping-return", icon: RotateCcw },
      { key: "nav.checkOrders", to: "/check-orders", icon: Search },
    ]
  },
  {
    key: "nav.couriers", icon: Users, children: [
      { key: "nav.couriersList", to: "/list-delegates", icon: Users },
      { key: "nav.addCourier", to: "/add-delegates", icon: UserPlus },
      { key: "nav.diaries", to: "/list-delegate-diaries", icon: FileText },
      { key: "nav.followCouriers", to: "/list-order-drivers-at-finish", icon: Eye },
      { key: "nav.returnsToStore", to: "/send-returnes-to-store", icon: Send },
    ]
  },
  {
    key: "nav.accounts", icon: Wallet, children: [
      { key: "nav.companyWallet", to: "/company-wallet", icon: Wallet },
      { key: "nav.sinbadCommissions", to: "/sinbad-commission-wallet", icon: Coins },
      { key: "nav.sellerAccounting", to: "/list-seller-accounting", icon: ReceiptText },
      { key: "nav.driverAccounting", to: "/list-driver-accounting", icon: ReceiptText },
      { key: "nav.networkAccounting", to: "/sinbad-network-wallet", icon: CircleDollarSign },
    ]
  },
  { key: "nav.pricing", to: "/prices-shipping-local", icon: BarChart3 },
  { key: "nav.supply", to: "/supply-management", icon: Boxes },
  {
    key: "nav.access", icon: Users, children: [
      { key: "nav.users", to: "/list-users", icon: Users },
      { key: "nav.roles", to: "/list-roles", icon: Cog },
    ]
  },
  {
    key: "nav.branches", icon: Building2, children: [
      { key: "nav.branchesList", to: "/list-branches", icon: Building2 },
      { key: "nav.deliverToBranch", to: "/delivery-to-the-branch", icon: Send },
      { key: "nav.receiveFromBranch", to: "/receipt-from-the-main-center", icon: ScanBarcode },
    ]
  },
  { key: "nav.clients", to: "/list-clients", icon: Users },
  {
    key: "nav.operations", icon: Truck, children: [
      { key: "nav.distributeShipments", to: "/list-distribution-of-representative-shipments", icon: Truck },
      { key: "nav.returnsToMerchants", to: "/list-distribution-of-representative-return-shipments", icon: RotateCcw },
    ]
  },
  {
    key: "nav.network", icon: Network, children: [
      { key: "nav.addNetworkShipping", to: "/add-network-shipping-request", icon: PlusCircle },
      { key: "nav.requestForNetwork", to: "/request-for-sinbad-network", icon: Send },
      { key: "nav.distributionRequests", to: "/distribution-requests", icon: FileText },
      { key: "nav.distributors", to: "/distributors", icon: Network },
      { key: "nav.receiveAsDistributor", to: "/sinbad-receive-way_to_dis", icon: ScanBarcode },
      { key: "nav.inboundShipments", to: "/inbound-shipments", icon: Truck },
      { key: "nav.distributedShipments", to: "/sinbad-distributed-shipments", icon: Truck },
      { key: "nav.supplierReturns", to: "/send-and-recive-shipments-to-supplier", icon: RotateCcw },
    ]
  },
  { key: "nav.reports", to: "/reports", icon: FileText },
  {
    key: "nav.store", icon: Store, children: [
      { key: "nav.marketplace", to: "/marketplace", icon: ShoppingBag },
      { key: "nav.myOrders", to: "/my-order-requests", icon: ListChecks },
    ]
  },
  { key: "nav.settings", to: "/profile/edit", icon: Cog },
];

export default function Sidebar({ collapsed }: { collapsed: boolean; onToggle?: () => void }) {
  const location = useLocation();
  const t = useT();
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach((n) => {
      if (n.children?.some((c) => location.pathname === c.to)) init[n.key] = true;
    });
    return init;
  });

  return (
    <aside
      className={clsx(
        "fixed top-16 bottom-0 start-0 z-20 transition-all duration-200 border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isOpen = open[item.key];
            return (
              <div key={item.key}>
                <button
                  onClick={() => setOpen((s) => ({ ...s, [item.key]: !s[item.key] }))}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
                    collapsed && "justify-center"
                  )}
                >
                  {Icon && <Icon size={18} className="shrink-0 text-brand-700 dark:text-brand-400" />}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-start">{t(item.key)}</span>
                      <ChevronDown size={14} className={clsx("transition-transform", isOpen && "rotate-180")} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ms-4 mt-0.5 space-y-0.5 border-s-2 border-brand-100 dark:border-slate-800 ps-2">
                    {item.children.map((child) => (
                      <SidebarLink key={child.key} item={child} />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return <SidebarLink key={item.key} item={item} collapsed={collapsed} />;
        })}
      </nav>
    </aside>
  );
}

function SidebarLink({ item, collapsed }: { item: Item; collapsed?: boolean }) {
  const Icon = item.icon;
  const t = useT();
  return (
    <NavLink
      to={item.to!}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          collapsed && "justify-center",
          isActive
            ? "bg-brand-800 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        )
      }
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      {!collapsed && <span className="flex-1 text-start">{t(item.key)}</span>}
    </NavLink>
  );
}
