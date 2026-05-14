import ShipmentsTable from "./ShipmentsTable";
export default function ProgressShipping() {
  return <ShipmentsTable titleKey="shipments.progress.title" subtitleKey="shipments.progress.subtitle" scope="progress" showQuickFilters={false} />;
}
