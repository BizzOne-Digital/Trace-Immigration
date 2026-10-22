import LegalPage from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("privacy", "/privacy");

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
