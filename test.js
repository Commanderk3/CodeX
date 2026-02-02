const normalize = (val) => {
  if (val == null) return "";

  let str = String(val).trim();

  // 🔴 FIX: normalize boolean strings (case-insensitive)
  const lower = str.toLowerCase();
  if (lower === "true" || lower === "false") {
    return lower; // always compare as "true" / "false"
  }

  try {
    const parsed = JSON.parse(str);

    // Normalize booleans coming from JSON.parse
    if (typeof parsed === "boolean") {
      return parsed.toString(); // "true" / "false"
    }

    if (typeof parsed === "object") {
      return JSON.stringify(parsed);
    }

    return String(parsed);
  } catch {
    return str;
  }
};

const input = "[1, 2, 3, 5]";
console.log(normalize(input));
console.log(typeof(normalize(input)));