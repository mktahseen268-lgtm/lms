import ScanShipmentsView from "../branches/ScanShipmentsView";
import { useT } from "../../i18n/LanguageContext";
export default function ReceiveAsDistributor() {
  const t = useT();
  return <ScanShipmentsView title={t("recvDist.title")} subtitle={t("recvDist.subtitle")} primaryLabel={t("scan.receiveBtn")} />;
}
