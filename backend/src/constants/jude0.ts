import dotenv from "dotenv";
dotenv.config();

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": process.env.RAPID_API_KEY as string,
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  "Content-Type": "application/json",
};

const batchSubmissionHeader = {
  "x-rapidapi-key": "c7d00fab76msha2c5d216863ec64p19c6cbjsn3f48485c9da6", //"c7d00fab76msha2c5d216863ec64p19c6cbjsn3f48485c9da6",
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com", //"judge029.p.rapidapi.com",
};

const fields = "token,stdout,stderr,status_id,language_id";

export { JUDGE0_BASE_URL, headers, batchSubmissionHeader, fields };
