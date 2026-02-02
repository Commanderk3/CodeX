export function normalize(val: unknown): string {
  if (val == null) return "";

  const str = String(val).trim();

  // 🔴 FIX: normalize boolean strings (case-insensitive)
  const lower = str.toLowerCase();
  if (lower === "true" || lower === "false") {
    return lower; // always "true" / "false"
  }

  try {
    const parsed: unknown = JSON.parse(str);

    if (typeof parsed === "boolean") {
      return parsed.toString(); // "true" / "false"
    }

    if (typeof parsed === "object" && parsed !== null) {
      return JSON.stringify(parsed);
    }

    return String(parsed);
  } catch {
    return str;
  }
}
