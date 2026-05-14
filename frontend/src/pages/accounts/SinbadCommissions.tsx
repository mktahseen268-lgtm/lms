import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { Coins } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

export default function SinbadCommissions() {
  const t = useT();
  return (
    <>
      <PageHeader title={t("sinbadComm.title")} subtitle={t("sinbadComm.subtitle")} />
      <EmptyState icon={<Coins size={28} />} title={t("sinbadComm.empty")} description={t("sinbadComm.emptyDesc")} />
    </>
  );
}
