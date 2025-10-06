const dotenv = require("dotenv");
dotenv.config({ path: "../../config/.env" });

exports.submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "c7d00fab76msha2c5d216863ec64p19c6cbjsn3f48485c9da6",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({submissions : submissions}),
  };

  try {
    const res = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=true",
      options
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  }
};

exports.getBatchSubmission = async (data) => {
  const submissions = data.submissions || data;

  if (!Array.isArray(submissions)) {
    throw new Error("Unexpected Judge0 response: " + JSON.stringify(data));
  }

  const tokens = submissions.map((item) => item.token).join("%2C");
  const fields = "token,stdout,stderr,status_id,language_id";

  let attempts = 0,
    maxAttempts = 5;
  while (attempts < maxAttempts) {
    const res = await fetch(
      `https://judge0-ce.p.rapidapi.com/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=${fields}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": "c7d00fab76msha2c5d216863ec64p19c6cbjsn3f48485c9da6",//"c7d00fab76msha2c5d216863ec64p19c6cbjsn3f48485c9da6",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com" //"judge029.p.rapidapi.com",
        },
      }
    );
    const result = await res.json();
    const allCompleted = result.submissions.every(
      (s) => s && s.status_id !== 1 && s.status_id !== 2
    );
    if (allCompleted) return result;
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log("Polling timed out");
}