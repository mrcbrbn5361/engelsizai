import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const createChat = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: `${SYSTEM_PROMPT}\n\nŞu anki saat: ${currentTime}`,
      tools: [{ googleSearch: {} }],
    },
  });
};
