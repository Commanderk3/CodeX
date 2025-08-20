const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = 5000;

const questions = require("./questions.json");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API is running",
  });
});


app.get("/getquestion", (req, res) => {
  try {
    console.log("Question sent");
    res.json({
      question_schema: questions[1]
    })
  } catch (err) {
    console.log("Error ", err);
  }
});

app.post("/submit", async (req, res) => {
  try {
    const { language, source_code } = req.body;
    const tokenData = await submitBatch(language, source_code);
    const result = await getBatchSubmission(tokenData);
    res.json({ result });
  } catch (err) {
    console.log(err);
  }
});

// const generateSubmissions = () => {
// }

async function submitBatch(language_id, code, submissions) {
  const base64Code = Buffer.from(code).toString("base64");
  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": process.env.RAPID_API,
      "x-rapidapi-host": "judge029.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submissions: [{ language_id: language_id, source_code: base64Code }],
    }),
  };

  //   submissions: [
  //   { language_id: 46, source_code: "ZWNobyBoZWxsbyBmcm9tIEJhc2gK" },
  //   { language_id: 71, source_code: "cHJpbnQoImhlbGxvIGZyb20gUHl0aG9uIikK" },
  //   { language_id: 72, source_code: "cHV0cygiaGVsbG8gZnJvbSBSdWJ5IikK" },
  // ],

  try {
    const res = await fetch(
      "https://judge029.p.rapidapi.com/submissions/batch?base64_encoded=true",
      options
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  }
}

async function getBatchSubmission(data) {
  const submissions = data.submissions || data;

  if (!Array.isArray(submissions)) {
    throw new Error("Unexpected Judge0 response: " + JSON.stringify(data));
  }

  const tokens = submissions.map((item) => item.token).join("%2C");
  const fields = "token,stdout,stderr,status_id,language_id";

  let attempts = 0,
    maxAttempts = 3;
  while (attempts < maxAttempts) {
    const res = await fetch(
      `https://judge029.p.rapidapi.com/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=${fields}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPID_API,
          "x-rapidapi-host": "judge029.p.rapidapi.com",
        },
      }
    );
    const result = await res.json();
    console.log("Polling result:", result);
    const allCompleted = result.submissions.every(
      (s) => s && s.status_id !== 1 && s.status_id !== 2
    );
    if (allCompleted) return result;
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log("Polling timed out");
}

// const validateCode = () => {

// }

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
