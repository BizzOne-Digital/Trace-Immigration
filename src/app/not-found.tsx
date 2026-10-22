import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-ivory px-5 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 font-serif text-5xl text-charcoal">This page could not be found.</h1>
      <p className="mt-4 max-w-md text-muted">The page may have moved. Let’s get you back on track.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-dark">Return home</Link>
        <Link href="/contact" className="link-gold">Contact us</Link>
      </div>
    </main>
  );
}
