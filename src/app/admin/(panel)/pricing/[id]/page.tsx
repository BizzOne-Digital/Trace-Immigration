import EditEntityPage from "@/components/admin/EditEntityPage";
import { PricingPlan } from "@/lib/models";
import { PRICING_FIELDS } from "@/lib/admin-fields";
import { savePricingPlan } from "../../content-actions";

export default async function EditPricing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EditEntityPage
      id={id}
      model={PricingPlan}
      fields={PRICING_FIELDS}
      save={savePricingPlan}
      base="/admin/pricing"
      noun="pricing item"
      titleField="name"
      defaults={{ status: "draft", order: 0 }}
    />
  );
}
