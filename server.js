require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/autofill-map", async (req, res) => {
  const { fields, userData } = req.body;

  const prompt = `
You are a smart form-filling assistant.

Your job is to help match stored user data to input fields on a web form.

### Stored User Data:
${JSON.stringify(userData, null, 2)}

### Fields on the Form:
${JSON.stringify(fields, null, 2)}

Return ONLY a valid JSON array of mappings. Each mapping must look like:
{ "fieldId": "name_or_id", "value": "user_value" }

Strictly return ONLY the JSON array. No explanations, no markdown, no comments.
`;

  try {
    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at form field identification and autofill.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const data = await llmRes.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]") + 1;
    const jsonOnly = content.slice(jsonStart, jsonEnd);

    const mappings = JSON.parse(jsonOnly);
    res.json({ mappings });
  } catch (err) {
    console.error("LLM mapping failed:", err);
    res
      .status(500)
      .json({ error: "LLM autofill failed", details: err.message });
  }
});

app.listen(5001, () => {
  console.log("🔁 LLM Autofill Server running at http://localhost:5001");
});
