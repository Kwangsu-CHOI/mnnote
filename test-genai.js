const { GoogleGenAI } = require("@google/genai");

// Try to load .env.local manually
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Error reading .env.local", e);
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
}

// User's snippet adapted for Node.js (require vs import)
const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
      console.log("Testing gemini-2.0-flash first (known to exist)...");
      try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "Hello",
        });
        console.log("2.0-flash Success:", response.text ? response.text() : response);
      } catch (e) {
          console.log("2.0-flash Failed:", e.message);
      }

      console.log("\nTesting gemini-3-flash-preview...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain how AI works in a few words",
      });
      console.log("gemini-3 Success:", response.text ? response.text() : response);
  } catch (error) {
      console.error("gemini-3 Failed:", error.message);
  }
}

main();
