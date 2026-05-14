import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AIAnalysis from "./pages/AIAnalysis";

import AddShipping from "./pages/shipments/AddShipping";
import AllShipping from "./pages/shipments/AllShipping";
import ProgressShipping from "./pages/shipments/ProgressShipping";
import EditRequests from "./pages/shipments/EditRequests";
import ReturnShipping from "./pages/shipments/ReturnShipping";
import CheckOrders from "./pages/shipments/CheckOrders";

import ListDelegates from "./pages/couriers/ListDelegates";
import AddDelegate from "./pages/couriers/AddDelegate";
import DelegateDiaries from "./pages/couriers/DelegateDiaries";
import FollowDelegates from "./pages/couriers/FollowDelegates";
import ReturnsToStore from "./pages/couriers/ReturnsToStore";

import CompanyWallet from "./pages/accounts/CompanyWallet";
import SinbadCommissions from "./pages/accounts/SinbadCommissions";
import SellerAccounting from "./pages/accounts/SellerAccounting";
import DriverAccounting from "./pages/accounts/DriverAccounting";
import NetworkWallet from "./pages/accounts/NetworkWallet";

import PricesShipping from "./pages/PricesShipping";
import SupplyManagement from "./pages/SupplyManagement";

import ListUsers from "./pages/admin/ListUsers";
import ListRoles from "./pages/admin/ListRoles";

import ListBranches from "./pages/branches/ListBranches";
import DeliveryToBranch from "./pages/branches/DeliveryToBranch";
import ReceiveFromBranch from "./pages/branches/ReceiveFromBranch";

import ListClients from "./pages/ListClients";

import DistributeToCouriers from "./pages/operations/DistributeToCouriers";
import DistributeReturns from "./pages/operations/DistributeReturns";

import AddNetworkShipping from "./pages/network/AddNetworkShipping";
import RequestForNetwork from "./pages/network/RequestForNetwork";
import DistributionRequests from "./pages/network/DistributionRequests";
import Distributors from "./pages/network/Distributors";
import ReceiveAsDistributor from "./pages/network/ReceiveAsDistributor";
import InboundShipments from "./pages/network/InboundShipments";
import DistributedShipments from "./pages/network/DistributedShipments";
import SupplierReturns from "./pages/network/SupplierReturns";

import Reports from "./pages/Reports";
import Marketplace from "./pages/store/Marketplace";
import MyOrderRequests from "./pages/store/MyOrderRequests";
import ProfileEdit from "./pages/ProfileEdit";

function Protected({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading... · جاري التحميل...</div>;
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />

        <Route path="/add-shipping-request" element={<AddShipping />} />
        <Route path="/list-shipping-all" element={<AllShipping />} />
        <Route path="/list-shipping-progress" element={<ProgressShipping />} />
        <Route path="/edit-shipping-request" element={<EditRequests />} />
        <Route path="/list-shipping-return" element={<ReturnShipping />} />
        <Route path="/check-orders" element={<CheckOrders />} />

        <Route path="/list-delegates" element={<ListDelegates />} />
        <Route path="/add-delegates" element={<AddDelegate />} />
        <Route path="/list-delegate-diaries" element={<DelegateDiaries />} />
        <Route path="/list-order-drivers-at-finish" element={<FollowDelegates />} />
        <Route path="/send-returnes-to-store" element={<ReturnsToStore />} />

        <Route path="/company-wallet" element={<CompanyWallet />} />
        <Route path="/sinbad-commission-wallet" element={<SinbadCommissions />} />
        <Route path="/list-seller-accounting" element={<SellerAccounting />} />
        <Route path="/list-driver-accounting" element={<DriverAccounting />} />
        <Route path="/sinbad-network-wallet" element={<NetworkWallet />} />

        <Route path="/prices-shipping-local" element={<PricesShipping />} />
        <Route path="/supply-management" element={<SupplyManagement />} />

        <Route path="/list-users" element={<ListUsers />} />
        <Route path="/list-roles" element={<ListRoles />} />

        <Route path="/list-branches" element={<ListBranches />} />
        <Route path="/delivery-to-the-branch" element={<DeliveryToBranch />} />
        <Route path="/receipt-from-the-main-center" element={<ReceiveFromBranch />} />

        <Route path="/list-clients" element={<ListClients />} />

        <Route path="/list-distribution-of-representative-shipments" element={<DistributeToCouriers />} />
        <Route path="/list-distribution-of-representative-return-shipments" element={<DistributeReturns />} />

        <Route path="/add-network-shipping-request" element={<AddNetworkShipping />} />
        <Route path="/request-for-sinbad-network" element={<RequestForNetwork />} />
        <Route path="/distribution-requests" element={<DistributionRequests />} />
        <Route path="/distributors" element={<Distributors />} />
        <Route path="/sinbad-receive-way_to_dis" element={<ReceiveAsDistributor />} />
        <Route path="/inbound-shipments" element={<InboundShipments />} />
        <Route path="/sinbad-distributed-shipments" element={<DistributedShipments />} />
        <Route path="/send-and-recive-shipments-to-supplier" element={<SupplierReturns />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/my-order-requests" element={<MyOrderRequests />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
