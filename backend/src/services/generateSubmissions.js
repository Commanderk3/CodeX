const formatInput = (value, language_id) => {
  let language;
  if (language_id === 54) {
    language = "c++";
  } else if (language_id === 71) {
    language = "python";
  } else if (language_id === 63) {
    language = "javascript";
  } else {
    language = "java";
  }

  let parsed;

  try {
    parsed = JSON.parse(value); // parse the string from DB
  } catch {
    parsed = value; // plain string
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
      case "js":
        return JSON.stringify(parsed); // [] → []
      case "c++":
        return JSON.stringify(parsed).replace(/\[/g, "{").replace(/\]/g, "}"); // [] → {}
      case "java":
        return JSON.stringify(parsed);
      default:
        return JSON.stringify(parsed);
    }
  }

  // Objects (for maps/dictionaries)
  if (typeof parsed === "object" && parsed !== null) {
    switch (language) {
      case "python":
      case "js":
        return JSON.stringify(parsed);
      case "c++":
        const entries = Object.entries(parsed)
          .map(([k, v]) => `{ "${k}", ${v} }`)
          .join(", ");
        return `{${entries}}`; // template will wrap in map<> if needed
      case "java":
        return JSON.stringify(parsed);
      default:
        return JSON.stringify(parsed);
    }
  }

  return value;
};

const generateCodeTemplate = (code, inputValue, templateCode, language_id) => {
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

exports.generateSubmissions = (language_id, code, template, testCases) => {
  const submissions = [];

  testCases.forEach((test) => {
    const codeString = generateCodeTemplate(
      code,
      test.input,
      template,
      language_id
    );
    const base64Code = Buffer.from(codeString).toString("base64");
    submissions.push({
      language_id: language_id,
      source_code: base64Code,
    });
  });

  return submissions;
};
