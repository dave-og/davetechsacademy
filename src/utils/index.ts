/**
 * Format a number as Nigerian Naira currency string.
 * e.g. 46000 → "₦46,000"
 */
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Convert a string to a URL-safe slug.
 * e.g. "UI/UX Design" → "ui-ux-design"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Conditionally join CSS class names, filtering out falsy values.
 * e.g. cn("btn", isActive && "btn--active", size && `btn--${size}`)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate star rating display string.
 * e.g. 4.8 → "★★★★★" (filled based on rating)
 */
export function renderStars(rating: number): string {
  const filled = Math.round(rating);
  const empty = 5 - filled;
  return "★".repeat(filled) + "☆".repeat(empty);
}

/**
 * Truncate text to a maximum character length, adding "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
