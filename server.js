require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Enhanced autofill mapping endpoint
app.post("/autofill-map", async (req, res) => {
  const { fields, userData } = req.body;

  const prompt = `
You are a smart form-filling assistant that matches stored user data to input fields on web forms.

### User's Stored Data:
${JSON.stringify(userData, null, 2)}

### Form Fields to Fill:
${JSON.stringify(fields, null, 2)}

Your task is to intelligently match the user's data to the appropriate form fields. Consider:
- Field labels and surrounding text
- Field types (text, email, phone, etc.)
- Common naming patterns
- Context clues from the form

Return ONLY a valid JSON array of mappings. Each mapping must look like:
{ "fieldId": "field_name_or_id", "value": "user_value" }

Examples:
- If form has "firstName" and user has "firstName": "John", map it
- If form has "email" and user has "email": "john@example.com", map it
- If form has "phone" and user has "phoneNumber": "123-456-7890", map it

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
                "You are an expert at form field identification and intelligent autofill mapping. Always return valid JSON arrays.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      }
    );

    if (!llmRes.ok) {
      throw new Error(`LLM API error: ${llmRes.status}`);
    }

    const data = await llmRes.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from response
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

// New resume generation endpoint
app.post("/generate-resume", async (req, res) => {
  const { jobDescription, userData } = req.body;

  if (!jobDescription || !userData) {
    return res.status(400).json({
      error: "Missing required data",
      details: "jobDescription and userData are required",
    });
  }

  const prompt = `
You are an expert resume writer and career coach. Create a professional, tailored resume based on the job description and user's information.

### Job Description:
${jobDescription}

### User's Information:
${JSON.stringify(userData, null, 2)}

Create a professional resume that:
1. Highlights relevant skills and experiences that match the job requirements
2. Uses action verbs and quantifiable achievements
3. Tailors the professional summary to the specific role
4. Emphasizes skills mentioned in the job description
5. Maintains a clean, professional format
6. Includes all relevant sections: Contact Info, Summary, Experience, Education, Skills, etc.

Format the resume in clean HTML with proper headings and structure. Use semantic HTML tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>.

Focus on making the resume compelling and relevant to this specific job opportunity.
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
                "You are an expert resume writer. Create professional, tailored resumes in clean HTML format. Focus on relevance and impact.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      }
    );

    if (!llmRes.ok) {
      throw new Error(`LLM API error: ${llmRes.status}`);
    }

    const data = await llmRes.json();
    const resumeContent = data.choices?.[0]?.message?.content || "";

    // Clean up the response to ensure it's valid HTML
    const cleanedResume = cleanResumeContent(resumeContent);

    res.json({
      resume: cleanedResume,
      jobDescription: jobDescription.substring(0, 200) + "...",
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Resume generation failed:", err);
    res
      .status(500)
      .json({ error: "Resume generation failed", details: err.message });
  }
});

// New resume update endpoint
app.post("/update-resume", async (req, res) => {
  const { originalResume, jobDescription, userData } = req.body;

  if (!originalResume || !jobDescription) {
    return res.status(400).json({
      error: "Missing required data",
      details: "originalResume and jobDescription are required",
    });
  }

  const prompt = `
You are an expert resume writer and career coach. Update the provided resume to better match the job description while maintaining the original structure and content.

### Original Resume:
${originalResume}

### Job Description:
${jobDescription}

### User's Additional Information:
${JSON.stringify(userData, null, 2)}

Your task is to:
1. Analyze the job requirements and identify key skills, qualifications, and keywords
2. Update the resume to highlight relevant experiences and skills that match the job
3. Add or modify sections to better align with the job description
4. Use action verbs and quantifiable achievements where possible
5. Maintain the original resume's structure and professional tone
6. Ensure all information is accurate and truthful
7. Add relevant keywords from the job description naturally

Focus on:
- Tailoring the professional summary/objective to the specific role
- Highlighting relevant skills and experiences
- Adding missing skills that are mentioned in the job description
- Rewording experiences to better match the job requirements
- Maintaining professional formatting

Return the updated resume in clean HTML format with proper headings and structure.
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
                "You are an expert resume writer. Update resumes to better match job descriptions while maintaining accuracy and professional formatting. Return clean HTML.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      }
    );

    if (!llmRes.ok) {
      throw new Error(`LLM API error: ${llmRes.status}`);
    }

    const data = await llmRes.json();
    const updatedResumeContent = data.choices?.[0]?.message?.content || "";

    // Clean up the response to ensure it's valid HTML
    const cleanedResume = cleanResumeContent(updatedResumeContent);

    res.json({
      resume: cleanedResume,
      originalLength: originalResume.length,
      updatedLength: cleanedResume.length,
      jobDescription: jobDescription.substring(0, 200) + "...",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Resume update failed:", err);
    res
      .status(500)
      .json({ error: "Resume update failed", details: err.message });
  }
});

// Helper function to clean and validate resume content
function cleanResumeContent(content) {
  // Remove any markdown formatting if present
  let cleaned = content.replace(/```html/g, "").replace(/```/g, "");

  // Ensure it starts with proper HTML structure
  if (!cleaned.includes("<h1>") && !cleaned.includes("<h2>")) {
    // If no HTML structure, wrap in basic HTML
    cleaned = `<div class="resume">${cleaned}</div>`;
  }

  // Remove any extra whitespace and normalize
  cleaned = cleaned.trim();

  return cleaned;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/autofill-map",
      "/generate-resume",
      "/update-resume",
      "/health",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "/autofill-map",
      "/generate-resume",
      "/update-resume",
      "/health",
    ],
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Job Fill Backend Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /autofill-map - Smart form field mapping`);
  console.log(`   POST /generate-resume - AI-powered resume generation`);
  console.log(`   POST /update-resume - AI-powered resume updating`);
  console.log(`   GET  /health - Health check`);
});
