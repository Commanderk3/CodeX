import dotenv from "dotenv";
import {
  JUDGE0_BASE_URL,
  batchSubmissionHeader,
  headers,
  fields
} from "../constants/jude0";
import {
  Submission,
  BatchSubmitResponse,
} from "../types/codeRunner";
import { Judge0BatchResult } from "../types/jude0";
dotenv.config({ path: "../../.env" });

const submitBatch = async (
  submissions: Submission[],
): Promise<BatchSubmitResponse> => {
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ submissions }),
  };

  try {
    const res = await fetch(
      `${JUDGE0_BASE_URL}/submissions/batch?base64_encoded=true`,
      options,
    );
    // if (!res.ok) throw new Error(`Judge0 submission failed: ${res.statusText}`);
    const data = (await res.json()) as BatchSubmitResponse;
    return data;
  } catch (err) {
    if (err instanceof Error) console.error("Error:", err.message);
    throw err;
  }
};

const getBatchSubmission = async (data: BatchSubmitResponse): Promise<Judge0BatchResult> => {
  const submissions = data.submissions || data;

  if (!Array.isArray(submissions)) {
    throw new Error("Unexpected Judge0 response: " + JSON.stringify(data));
  }

  const tokens = submissions.map((item) => item.token).join("%2C");
  
  let attempts = 0;
  const maxAttempts = 5;

  try {
    while (attempts < maxAttempts) {
      const res = await fetch(
        `${JUDGE0_BASE_URL}/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=${fields}`,
        {
          method: "GET",
          headers: batchSubmissionHeader,
        },
      );

      if (!res.ok) {
        throw new Error(`Judge0 polling failed: ${res.statusText}`);
      }

      const result = (await res.json()) as Judge0BatchResult;
      const allCompleted = result.submissions.every(
        (s) => s && s.status_id !== 1 && s.status_id !== 2,
      );

      if (allCompleted) return result;

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Judge0 polling timed out");
  } catch (err) {
    if (err instanceof Error)
      console.error(`Judge0 Batch submission failed: ${err}`);
    throw err;
  }
};

export { submitBatch, getBatchSubmission };
