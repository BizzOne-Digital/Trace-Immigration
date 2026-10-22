import EditEntityPage from "@/components/admin/EditEntityPage";
import { TeamMember } from "@/lib/models";
import { TEAM_FIELDS } from "@/lib/admin-fields";
import { saveTeamMember } from "../../content-actions";

export default async function EditTeam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EditEntityPage
      id={id}
      model={TeamMember}
      fields={TEAM_FIELDS}
      save={saveTeamMember}
      base="/admin/team"
      noun="team member"
      titleField="name"
      defaults={{ status: "draft", order: 0 }}
      notice={<p className="mb-6 rounded-sm border border-[#f0dcae] bg-[#fdf7e9] px-4 py-3 text-sm text-[#6b4a12]">Publish only names, biographies, credentials and portraits that the person has approved. Stock photos must never be used as team portraits.</p>}
    />
  );
}
