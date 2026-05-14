import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { Network, ArrowLeft, ArrowRight } from "lucide-react";
import { useT, useLanguage } from "../../i18n/LanguageContext";

export default function Distributors() {
  const t = useT();
  const { dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <>
      <PageHeader title={t("dist.title")} subtitle={t("dist.subtitle")} />
      <EmptyState
        icon={<Network size={28} />}
        title={t("dist.empty")}
        description={t("dist.emptyDesc")}
        action={<button className="btn-primary">{t("dist.browse")} <Arrow size={16} /></button>}
      />
    </>
  );
}
