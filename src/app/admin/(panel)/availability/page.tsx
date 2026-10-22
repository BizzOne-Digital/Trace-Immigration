import { AdminHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { getAvailability } from "@/lib/booking";
import { saveAvailability } from "../ops-actions";
import AvailabilityForm from "./AvailabilityForm";

export default async function AvailabilityAdmin() {
  await requireAdminPage();
  const av = await getAvailability();
  return (
    <>
      <AdminHeader title="Availability" description="Weekly consultation hours, timezone and booking rules." />
      <AvailabilityForm initial={JSON.parse(JSON.stringify(av))} save={saveAvailability} />
    </>
  );
}
