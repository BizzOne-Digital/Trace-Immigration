import Link from "next/link";
import { AdminHeader, EmptyRow, NewButton, StatusBadge, Table } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { TeamMember } from "@/lib/models";
import { deleteTeamMember } from "../content-actions";

export default async function TeamAdmin() {
  await requireAdminPage();
  await connectDB();
  const items = await TeamMember.find().sort({ order: 1, name: 1 }).select("name role status order").lean();
  return (
    <>
      <AdminHeader title="Team" description="Only published, approved profiles appear on the Our Team page." action={<NewButton href="/admin/team/new" label="New profile" />} />
      {items.length === 0 ? (
        <EmptyRow text="No team profiles yet. The public page shows an elegant placeholder until a profile is published." />
      ) : (
        <Table head={["Name", "Role", "Status", "Order", ""]}>
          {items.map((m) => (
            <tr key={String(m._id)}>
              <td className="px-4 py-3"><Link href={`/admin/team/${m._id}`} className="font-medium hover:text-gold-ink">{m.name}</Link></td>
              <td className="px-4 py-3 text-muted">{m.role || "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
              <td className="px-4 py-3">{m.order}</td>
              <td className="px-4 py-3 text-right">
                <ActionButton action={deleteTeamMember.bind(null, String(m._id))} variant="danger" confirm={`Delete ${m.name}'s profile?`}>Delete</ActionButton>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
