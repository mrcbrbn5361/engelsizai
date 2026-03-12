import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const chat = ai.chats.create({
  model: "gemini-3.1-flash-lite-preview",
  config: {
    systemInstruction: SYSTEM_PROMPT,
  },
});
