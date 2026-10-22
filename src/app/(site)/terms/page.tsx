import LegalPage from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("terms", "/terms");

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
