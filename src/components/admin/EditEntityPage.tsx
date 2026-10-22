import { notFound } from "next/navigation";
import { Types, type Model } from "mongoose";
import EntityForm, { type ActionResult, type FieldConfig } from "./EntityForm";
import { AdminHeader, Panel } from "./ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { plain } from "@/lib/content";

type Props = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  fields: FieldConfig[];
  save: (id: string | null, fd: FormData) => Promise<ActionResult>;
  base: string;
  noun: string;
  titleField: string;
  defaults?: Record<string, unknown>;
  notice?: React.ReactNode;
};

/** Shared create/edit screen: "/new" creates, an ObjectId edits. */
export default async function EditEntityPage({ id, model, fields, save, base, noun, titleField, defaults = {}, notice }: Props) {
  await requireAdminPage();
  const isNew = id === "new";
  let initial: Record<string, unknown> = defaults;
  if (!isNew) {
    if (!Types.ObjectId.isValid(id)) notFound();
    await connectDB();
    const doc = await model.findById(id).lean();
    if (!doc) notFound();
    initial = plain(doc as object);
  }
  return (
    <>
      <AdminHeader title={isNew ? `New ${noun}` : String(initial[titleField] ?? noun)} back={base} />
      {notice}
      <Panel>
        <EntityForm
          fields={fields}
          initial={initial}
          action={save.bind(null, isNew ? null : id)}
          redirectTo={isNew ? `${base}/:id` : undefined}
          submitLabel={isNew ? `Create ${noun}` : "Save changes"}
        />
      </Panel>
    </>
  );
}
