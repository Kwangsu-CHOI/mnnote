const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to load .env.local manually since we are running a standalone script
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Error reading .env.local", e);
}

const arg = process.argv[2];
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || arg;

if (!apiKey) {
  console.error("Please provide GOOGLE_GENERATIVE_AI_API_KEY in .env.local or as an argument.");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
console.log("Fetching from URL:", url.replace(apiKey, "HIDDEN_KEY"));

const req = https.get(url, (res) => {
  console.log("Response received. Status:", res.statusCode);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        fs.writeFileSync('models.txt', "API Error: " + json.error.message);
      } else if (json.models) {
        let output = "Available Models:\n";
        json.models.forEach(model => {
          if (model.supportedGenerationMethods.includes("generateContent")) {
             output += `- ${model.name} (DisplayName: ${model.displayName})\n`;
          }
        });
        fs.writeFileSync('models.txt', output);
        console.log("Output written to models.txt");
      } else {
        fs.writeFileSync('models.txt', "No models found or unexpected format: " + JSON.stringify(json));
      }
    } catch (e) {
      console.error("Error parsing JSON:", e.message);
      console.log("Raw response:", data);
    }
  });

}).on("error", (err) => {
  console.error("Error: " + err.message);
});
