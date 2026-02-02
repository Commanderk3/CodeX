import { normalize } from "../utils/normalize";

interface JudgeResult {
  status_id: number;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
}

interface TestCase {
  output: unknown;
}

export interface CodeResult {
  errorMsg: string | null;
  resultStatus: boolean | null;
  mismatchedAt: number | null;
}

export function checkTestCases(
  result: JudgeResult[],
  testCases: TestCase[]
): CodeResult {
  const codeResult: CodeResult = {
    errorMsg: null,
    resultStatus: null,
    mismatchedAt: null,
  };

  for (let i = 0; i < testCases.length; i++) {
    const res = result[i];

    // Compilation / runtime error
    if (res.status_id >= 4 && res.status_id <= 14) {
      codeResult.errorMsg =
        res.stderr || res.compile_output || "";
      codeResult.resultStatus = false;
      codeResult.mismatchedAt = i;
      return codeResult;
    }

    const actual = normalize(res.stdout ?? "");
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
}
