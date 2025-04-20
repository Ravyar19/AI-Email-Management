const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
  console.error(
    "CRITICAL ERROR: GEMINI_API_KEY is not defined. Ensure .env file is loaded correctly in index.js."
  );
}

let model;
if (geminiAPIKey) {
  try {
    const genAI = new GoogleGenerativeAI(geminiAPIKey);
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-04-17",
    });
    console.log("Gemini AI Client Initialized in Service.");
  } catch (initError) {
    console.error(
      "CRITICAL ERROR: Failed to initialize Gemini AI Client:",
      initError
    );
    // Handle cases where initialization fails even with a key
  }
} else {
  console.warn(
    "Gemini Service started without an API key. Analysis will fail."
  );
  // Set model to null or a mock object if needed for graceful failure
  model = null;
}

/**
 * Analyzes email subject and body using Gemini for classification and sentiment.
 * @param {string} subject The email subject.
 * @param {string} body The email body text.
 * @returns {Promise<object|null>} A promise that resolves to an object
 * with classification and sentiment, or null on error/misconfiguration.
 */
async function analyzeEmailWithGemini(subject, body) {
  if (!model) {
    console.error("Gemini model is not available. Cannot analyze email.");
    return null;
  }

  console.log("-----\nAnalyzing email with Gemini...");
  console.log("Subject:", subject);

  const prompt = `
        Analyze the following email content (subject and body) and provide the analysis strictly in JSON format.
        The JSON object should have two keys:
        1. "classification": Categorize the email into one of the following: "Support", "Sales", "Invoice", "Spam", "Personal", "Project Update", "Marketing", "Other".
        2. "sentiment": Determine the overall sentiment: "Positive", "Negative", "Neutral".

        Subject: ${subject}

        Body:
        ${body}

        Respond ONLY with the JSON object. Example: {"classification": "Sales", "sentiment": "Positive"}
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Raw Response Text:", text); // Log the raw response for debugging

    // Attempt to parse the JSON from the response text
    const cleanedText = text.replace(/^```json\s*|```$/g, "").trim(); // Remove potential markdown fences

    try {
      const analysis = JSON.parse(cleanedText);
      // Basic validation of expected keys
      if (analysis.classification && analysis.sentiment) {
        console.log("Gemini Analysis Parsed:", analysis);
        return analysis;
      } else {
        console.error(
          "Error: Parsed JSON from Gemini is missing expected keys."
        );
        console.error("Parsed Object:", analysis);
        return null;
      }
    } catch (parseError) {
      console.error("Error parsing JSON response from Gemini:", parseError);
      console.error("Received text was:", cleanedText); // Log the text that failed parsing
      return null;
    }
  } catch (error) {
    if (error.message) {
      console.error("Error calling Gemini API:", error.message);
    } else {
      console.error("Error calling Gemini API:", error);
    }
    return null; // Return null to indicate failure
  } finally {
    console.log("-----");
  }
}

module.exports = {
  analyzeEmailWithGemini,
};
