require("dotenv").config({ path: ".env.local" });

const express = require("express");
const geminiService = require("./services/geminiService");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Email POC Server is running!");
});

app.post("/analyze-test", async (req, res) => {
  console.log("Received request on /analyze-test");

  const sampleSubject = "Inquiry about Product Pricing";
  const sampleBody = `
        Hello Sales Team,

        I hope this email finds you well.
        I was looking at your product catalog online and I'm very interested in the 'SuperWidget Pro'.
        Could you please provide me with the current pricing details and any available bulk discounts?

        Looking forward to your response.

        Best regards,
        Potential Customer
    `;

  const analysisResult = await geminiService.analyzeEmailWithGemini(
    sampleSubject,
    sampleBody
  );

  if (analysisResult) {
    console.log("Sending analysis result back to client.");
    res.json({
      message: "Analysis successful (using hardcoded data)",
      analysis: analysisResult,
    });
  } else {
    console.error("Analysis failed in /analyze-test endpoint.");
    res.status(500).json({
      message: "Analysis failed (using hardcoded data)",
      error: "Failed to get analysis from Gemini. Check server logs.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
