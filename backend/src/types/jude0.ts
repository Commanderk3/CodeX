interface Judge0Submission {
  token: string;
}

interface Judge0BatchResponse {
  submissions: Judge0Submission[];
}

interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  status_id: number;
  language_id: number;
}

interface Judge0BatchResult {
  submissions: Judge0Result[];
}

interface CodeResult {
  errorMsg: string | null;
  resultStatus: boolean | null;
  mismatchedAt: number | null;
}


export { Judge0Submission, Judge0BatchResponse, Judge0Result, Judge0BatchResult, CodeResult }
