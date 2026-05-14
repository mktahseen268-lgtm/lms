import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useT } from "../../i18n/LanguageContext";
export default function SupplierReturns() {
  const t = useT();
  return (<><PageHeader title={t("supRet.title")} subtitle={t("supRet.subtitle")} /><EmptyState title={t("supRet.empty")} /></>);
}
