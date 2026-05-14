import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";
export default function InboundShipments() {
  const t = useT();
  return (<><PageHeader title={t("inbound.title")} subtitle={t("inbound.subtitle")} /><EmptyState title={t("inbound.empty")} /></>);
}
