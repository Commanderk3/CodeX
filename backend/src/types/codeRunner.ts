interface Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface BatchSubmitResponse {
  submissions: { token: string }[];
}

interface JudgeResult {
  token: string;
  stdout?: string | null;
  stderr?: string | null;
  status_id: number;
  language_id: number;
}

interface BatchResultResponse {
  submissions: JudgeResult[];
}

export interface SubmitCodePayload {
  language_id: number;
  source_code: string;
  roomId: string;
  playerName: string;
}


export { Submission, BatchSubmitResponse, BatchResultResponse }