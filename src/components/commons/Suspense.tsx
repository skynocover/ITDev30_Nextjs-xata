import dynamic from "next/dynamic";
import { ServicesRecord } from "../../xata";

const DynamicComponent = dynamic(() => import("@/components/layout/Title"), {
  loading: () => <p>Loading dynamic component...</p>,
  ssr: false,
});

export default function DynamicImportExample({
  service,
}: {
  service: ServicesRecord;
}) {
  return (
    <div>
      <DynamicComponent service={service} />
    </div>
  );
}
