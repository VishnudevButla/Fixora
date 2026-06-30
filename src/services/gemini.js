import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Analyzes an issue photo using Gemini 1.5 Flash.
 * @param {string} base64Data - Base64 encoded string of the image.
 * @param {string} mimeType - The mime type of the image (e.g. image/jpeg, image/png).
 * @returns {Promise<{category: string, title: string, severity: string, description: string}>}
 */
export async function analyzeIssueImage(base64Data, mimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured in .env");
  }

  const prompt = `Analyze this image of a community/neighborhood issue (e.g. pothole, waste, broken streetlight, vandalism).
Provide a structured JSON response with the following keys:
- title: A short, descriptive title (e.g., "Deep Pothole on Main St").
- category: Categorize the issue strictly as one of: "Pothole / Road Damage", "Streetlight Out", "Graffiti / Vandalism", "Trash / Illegal Dumping", or "Other".
- severity: Assess the hazard level ("Low", "Medium", "High", "Critical").
- description: A brief description of what is seen and why it needs attention.

Return only the valid JSON object.`;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("No response received from Gemini model.");
    }

    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

