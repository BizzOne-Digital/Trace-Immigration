import EditEntityPage from "@/components/admin/EditEntityPage";
import { ConsultationType } from "@/lib/models";
import { CONSULTATION_TYPE_FIELDS } from "@/lib/admin-fields";
import { saveConsultationType } from "../../content-actions";

export default async function EditConsultationType({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EditEntityPage
      id={id}
      model={ConsultationType}
      fields={CONSULTATION_TYPE_FIELDS}
      save={saveConsultationType}
      base="/admin/consultation-types"
      noun="consultation type"
      titleField="name"
      defaults={{ status: "draft", order: 0, durationMinutes: 60 }}
    />
  );
}
