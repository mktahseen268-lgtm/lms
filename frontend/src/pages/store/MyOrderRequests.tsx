import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";
export default function MyOrderRequests() {
  const t = useT();
  return (
    <>
      <PageHeader title={t("myOrders.title")} subtitle={t("myOrders.subtitle")} />
      <EmptyState title={t("myOrders.empty")} description={t("myOrders.emptyDesc")} />
    </>
  );
}
