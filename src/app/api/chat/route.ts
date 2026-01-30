import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("API Key is missing");
      return Response.json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }, { status: 500 });
    }
    console.log("API Key found, starts with:", apiKey.substring(0, 4));

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const { messages, context } = await req.json();

    const { text, toolCalls } = await generateText({
      model: google('gemini-3-flash-preview'),
      messages,
      system: `You are a helpful AI assistant embedded in a note app.
      
      Instructions:
      - You MUST answer in the SAME LANGUAGE as the user's last message.
      - If the user's language is unclear, default to English.
      - Do not use German unless the user speaks German.
      - Do not use German unless the user speaks German.
      - Answer in standard Markdown format.
      - Do NOT use JSON or code blocks for the main response.

      
      Context from the current note:
      ${context || "No context provided."}
      `,
    });

    return Response.json({ text, toolCalls });
  } catch (error: any) {
    console.error("AI Error:", error);
    return Response.json({ 
      error: error.message || "Failed to generate response",
      details: error.toString()
    }, { status: 500 });
  }
}
