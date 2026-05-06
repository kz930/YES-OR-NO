/**
 * Map category slug → palette colors used across cards (favorites,
 * /explore tiles, swipe deck, etc).
 */
export const CATEGORY_PALETTE: Record<
  string,
  { bg: string; accent: string; emoji: string }
> = {
  qipashuo:    { bg: "#DBF68F", accent: "#7B9434", emoji: "🎤" },
  philosophy:  { bg: "#C7DFF9", accent: "#3B6AA8", emoji: "🧠" },
  "either-or": { bg: "#D7C7ED", accent: "#7553B5", emoji: "🔀" },
  internet:    { bg: "#F9D9C3", accent: "#A65A2A", emoji: "💭" },
};

const FALLBACK = { bg: "#92C3A5", accent: "#1F2A24", emoji: "✨" };

export function paletteFor(slug: string | null | undefined) {
  if (!slug) return FALLBACK;
  return CATEGORY_PALETTE[slug] ?? FALLBACK;
}
