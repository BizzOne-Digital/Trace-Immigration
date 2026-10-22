/** Generated website photography. Existing admin uploads remain unchanged. */
export const IMAGES = {
  "torontoSunrise": "/images/toronto-sunrise.webp",
  "consultationDesk": "/images/consultation-desk.webp",
  "moraineLake": "/images/moraine-lake.webp",
  "virtualMeeting": "/images/virtual-meeting.webp",
  "weddingChairs": "/images/spousal-sponsorship.webp",
  "houseKeys": "/images/permanent-residence.webp",
  "torontoPark": "/images/canadian-citizenship.webp",
  "familyBeach": "/images/family-immigration.webp",
  "reviewMeeting": "/images/complex-case-review.webp",
  "harbourfront": "/images/harbourfront.webp"
} as const;
const LEGACY_IMAGES: Record<string, string> = {
  "/photo-1507992781348-310259076fe0": "/images/toronto-sunrise.webp",
  "/photo-1454165804606-c3d57bc86b40": "/images/consultation-desk.webp",
  "/photo-1503614472-8c93d56e92ce": "/images/moraine-lake.webp",
  "/photo-1517245386807-bb43f82c33c4": "/images/virtual-meeting.webp",
  "/photo-1522673607200-164d1b6ce486": "/images/spousal-sponsorship.webp",
  "/photo-1560518883-ce09059eeffa": "/images/permanent-residence.webp",
  "/photo-1517090504586-fde19ea6066f": "/images/canadian-citizenship.webp",
  "/photo-1511895426328-dc8714191300": "/images/family-immigration.webp",
  "/photo-1600880292203-757bb62b4baf": "/images/complex-case-review.webp",
  "/photo-1519832979-6fa011b87667": "/images/harbourfront.webp"
};
/** Resolve known starter photos, including URLs already saved in MongoDB. */
export function resolveImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (src === "/brand/logo.png") return "/brand/logo-transparent.png";
  try {
    const url = new URL(src);
    if (url.origin === "https://images.unsplash.com") return LEGACY_IMAGES[url.pathname] ?? src;
  } catch { /* Local paths need no conversion. */ }
  return src;
}
