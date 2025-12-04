const normalize = (val) => {
  if (val == null) return "";
  const str = String(val).trim();
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === "object") {
      return JSON.stringify(parsed);
    }
    return String(parsed);
  } catch {
    return str;
  }
};

exports.checkTestCases = (result, testCases) => {

  const codeResult = {
    errorMsg: null,
    resultStatus: null,
    mismatchedAt: null,
  }

  for (let i = 0; i < testCases.length; i++) {
    const res = result[i];

    // Compilation / runtime error
    if (res.status_id >= 4 && res.status_id <= 14) {
      codeResult.errorMsg = res.stderr || res.compile_output || "";
      codeResult.resultStatus = false;
      codeResult.mismatchedAt = i;
      return codeResult;
    }

    const actual = normalize(res.stdout || "");
    const expected = normalize(testCases[i].output);

    if (actual !== expected) {
      codeResult.resultStatus = false;
      codeResult.mismatchedAt = i;
      return codeResult;
    }
  }

  codeResult.resultStatus = true;
  codeResult.mismatchedAt = testCases.length;
  return codeResult;
};
