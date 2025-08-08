const fetch = require("node-fetch");

const BASE_URL = "http://localhost:5001";

async function testHealth() {
  console.log("🏥 Testing health endpoint...");
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health check passed:", data);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return false;
  }
}

async function testAutofillMapping() {
  console.log("\n🤖 Testing autofill mapping...");
  try {
    const testData = {
      fields: [
        {
          id: "firstName",
          labelText: "First Name",
          placeholder: "Enter your first name",
          surroundingText: "Personal Information",
        },
        {
          id: "email",
          labelText: "Email Address",
          placeholder: "Enter your email",
          surroundingText: "Contact Information",
        },
      ],
      userData: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "123-456-7890",
      },
    };

    const response = await fetch(`${BASE_URL}/autofill-map`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("✅ Autofill mapping test passed:", data);
    return true;
  } catch (error) {
    console.error("❌ Autofill mapping test failed:", error.message);
    return false;
  }
}

async function testResumeGeneration() {
  console.log("\n📄 Testing resume generation...");
  try {
    const testData = {
      jobDescription:
        "We are looking for a skilled JavaScript developer with experience in React and Node.js. The ideal candidate should have strong problem-solving skills and experience with modern web technologies.",
      userData: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "123-456-7890",
        skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        jobTitle: "Software Developer",
        companyName: "Tech Corp",
        jobDuties: "Developed web applications using React and Node.js",
        degree: "Bachelor of Science in Computer Science",
        schoolName: "University of Technology",
      },
    };

    const response = await fetch(`${BASE_URL}/generate-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("✅ Resume generation test passed");
    console.log(
      "📝 Generated resume length:",
      data.resume.length,
      "characters"
    );
    console.log("🕒 Generated at:", data.generatedAt);
    return true;
  } catch (error) {
    console.error("❌ Resume generation test failed:", error.message);
    return false;
  }
}

async function testResumeUpdate() {
  console.log("\n📝 Testing resume update...");
  try {
    const testData = {
      originalResume: `JOHN DOE
Software Developer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Software Developer, Tech Corp (2020-2023)
- Developed web applications using JavaScript
- Worked with databases and APIs
- Collaborated with team members

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2020

SKILLS
JavaScript, HTML, CSS, Basic Programming`,
      jobDescription:
        "We are looking for a senior JavaScript developer with expertise in React, Node.js, and modern web technologies. The ideal candidate should have strong problem-solving skills, experience with cloud platforms, and a passion for clean code.",
      userData: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phoneNumber: "(555) 123-4567",
        skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        jobTitle: "Software Developer",
      },
    };

    const response = await fetch(`${BASE_URL}/update-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log("✅ Resume update test passed");
    console.log("📝 Original length:", data.originalLength, "characters");
    console.log("📝 Updated length:", data.updatedLength, "characters");
    console.log("🕒 Updated at:", data.updatedAt);
    return true;
  } catch (error) {
    console.error("❌ Resume update test failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Job Fill Backend Tests...\n");

  const healthPassed = await testHealth();
  const autofillPassed = await testAutofillMapping();
  const resumePassed = await testResumeGeneration();
  const updatePassed = await testResumeUpdate();

  console.log("\n📊 Test Results:");
  console.log(`Health Check: ${healthPassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Autofill Mapping: ${autofillPassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Resume Generation: ${resumePassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Resume Update: ${updatePassed ? "✅ PASS" : "❌ FAIL"}`);

  const allPassed =
    healthPassed && autofillPassed && resumePassed && updatePassed;
  console.log(
    `\n${allPassed ? "🎉 All tests passed!" : "⚠️  Some tests failed."}`
  );

  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Test runner error:", error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testHealth,
  testAutofillMapping,
  testResumeGeneration,
  testResumeUpdate,
};
