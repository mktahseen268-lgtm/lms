import ScanShipmentsView from "./ScanShipmentsView";
import { useT } from "../../i18n/LanguageContext";
export default function ReceiveFromBranch() {
  const t = useT();
  return <ScanShipmentsView mode="receive" title={t("scan.receiveTitle")} subtitle={t("scan.receiveSubtitle")} primaryLabel={t("scan.receiveBtn")} />;
}
