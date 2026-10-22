import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await getCurrentAdmin().catch(() => null);
  if (admin) redirect("/admin");
  const configured = Boolean(process.env.MONGODB_URI && (process.env.SESSION_SECRET?.length ?? 0) >= 32);

  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm rounded-sm border border-line bg-white p-8">
        <Image src="/brand/logo-transparent.png" alt="Trace Immigration" width={190} height={70} className="mx-auto h-14 w-auto" priority />
        <h1 className="mt-6 text-center font-serif text-3xl text-charcoal">Admin sign in</h1>
        {!configured && (
          <p role="alert" className="mt-4 border border-[#f0dcae] bg-[#fdf7e9] px-3 py-2 text-xs text-[#6b4a12]">
            MONGODB_URI and SESSION_SECRET (32+ characters) must be configured before signing in. See README.
          </p>
        )}
        <div className="mt-6"><LoginForm /></div>
      </div>
    </main>
  );
}
