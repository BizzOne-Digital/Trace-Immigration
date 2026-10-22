import EditEntityPage from "@/components/admin/EditEntityPage";
import { Testimonial } from "@/lib/models";
import { TESTIMONIAL_FIELDS } from "@/lib/admin-fields";
import { saveTestimonial } from "../../content-actions";

export default async function EditTestimonial({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EditEntityPage
      id={id}
      model={Testimonial}
      fields={TESTIMONIAL_FIELDS}
      save={saveTestimonial}
      base="/admin/testimonials"
      noun="testimonial"
      titleField="clientName"
      defaults={{ status: "pending", order: 0 }}
      notice={<p className="mb-6 rounded-sm border border-[#f0dcae] bg-[#fdf7e9] px-4 py-3 text-sm text-[#6b4a12]">Enter only genuine client testimonials. Approval requires the client&apos;s written consent to publish.</p>}
    />
  );
}
