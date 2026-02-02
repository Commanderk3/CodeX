type LanguageId = 54 | 71 | 63 | number;

type Language = "c++" | "python" | "javascript" | "java";

interface TestCase {
  input: Record<string, unknown>;
}

interface Submission {
  language_id: number;
  source_code: string;
}

const formatInput = (value: unknown, language_id: LanguageId): string => {
  let language: Language;

  if (language_id === 54) {
    language = "c++";
  } else if (language_id === 71) {
    language = "python";
  } else if (language_id === 63) {
    language = "javascript";
  } else {
    language = "java";
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(String(value));
  } catch {
    parsed = value;
  }

  // Strings
  if (typeof parsed === "string") {
    return `"${parsed}"`;
  }

  // Numbers / booleans
  if (typeof parsed === "number" || typeof parsed === "boolean") {
    return parsed.toString();
  }

  // Arrays
  if (Array.isArray(parsed)) {
    switch (language) {
      case "python":
      case "javascript":
        return JSON.stringify(parsed);
      case "c++":
        return JSON.stringify(parsed)
          .replace(/\[/g, "{")
          .replace(/\]/g, "}");
      case "java":
      default:
        return JSON.stringify(parsed);
    }
  }

  // Objects
  if (typeof parsed === "object" && parsed !== null) {
    switch (language) {
      case "python":
      case "javascript":
        return JSON.stringify(parsed);
      case "c++":
        return `{${Object.entries(parsed)
          .map(([k, v]) => `{ "${k}", ${v} }`)
          .join(", ")}}`;
      case "java":
      default:
        return JSON.stringify(parsed);
    }
  }

  return String(value);
};

const generateCodeTemplate = (
  code: string,
  inputValue: Record<string, unknown>,
  templateCode: string,
  language_id: LanguageId
): string => {
  let codeString = templateCode;

  let count = 1;
  const inputs = Object.values(inputValue);

  inputs.forEach((val) => {
    const valWithType = formatInput(val, language_id);
    const regex = new RegExp(`INPUT${count}`, "g");
    codeString = codeString.replace(regex, valWithType);
    count++;
  });

  codeString = codeString.replace("USER_CODE", code);
  return codeString;
};

export const generateSubmissions = (
  language_id: number,
  code: string,
  template: string,
  testCases: TestCase[]
): Submission[] => {
  const submissions: Submission[] = [];

  testCases.forEach((test) => {
    const codeString = generateCodeTemplate(
      code,
      test.input,
      template,
      language_id
    );

    const base64Code = Buffer.from(codeString).toString("base64");

    submissions.push({
      language_id,
      source_code: base64Code,
    });
  });

  return submissions;
};
