import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";
export default function DistributedShipments() {
  const t = useT();
  return (<><PageHeader title={t("distOut.title")} subtitle={t("distOut.subtitle")} /><EmptyState title={t("distOut.empty")} /></>);
}
