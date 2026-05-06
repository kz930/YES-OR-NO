/**
 * Map category slug → palette colors used across cards (favorites,
 * /explore tiles, swipe deck, etc).
 *
 * All four colors live in the same warm earth-tone family — sand, sage,
 * peach clay, dusty mauve. They're distinct enough to recognize but
 * harmonious together (vs. the previous rainbow of green/blue/purple/peach).
 */
export const CATEGORY_PALETTE: Record<
  string,
  { bg: string; accent: string; emoji: string }
> = {
  qipashuo:    { bg: "#D4B898", accent: "#5D3520", emoji: "🎤" }, // sand
  philosophy:  { bg: "#A8C19F", accent: "#2F4A2F", emoji: "🧠" }, // sage
  "either-or": { bg: "#E8B59F", accent: "#7A3520", emoji: "🔀" }, // peach clay
  internet:    { bg: "#C9A8B5", accent: "#5C2D40", emoji: "💭" }, // dusty mauve
};

const FALLBACK = { bg: "#A8C19F", accent: "#2F4A2F", emoji: "✨" };

export function paletteFor(slug: string | null | undefined) {
  if (!slug) return FALLBACK;
  return CATEGORY_PALETTE[slug] ?? FALLBACK;
}
