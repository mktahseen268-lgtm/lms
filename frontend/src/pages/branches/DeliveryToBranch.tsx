import ScanShipmentsView from "./ScanShipmentsView";
import { useT } from "../../i18n/LanguageContext";
export default function DeliveryToBranch() {
  const t = useT();
  return <ScanShipmentsView mode="deliver" title={t("scan.deliverTitle")} subtitle={t("scan.deliverSubtitle")} showBranchSelector primaryLabel={t("scan.deliverSend")} showExportToExcel />;
}
