import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, Assessment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a batch of English questions based on a topic.
 */
export const generateQuestions = async (topic: string, count: number = 5): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} beginner English communication questions about the topic: "${topic}".
      The questions should be simple, suitable for Vietnamese beginners learning English.
      Ensure the questions are diverse (greeting, asking specific info, etc.).
      
      Return a JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "The English question text" },
              context: { type: Type.STRING, description: "Optional Vietnamese hint or context" },
              difficulty: { type: Type.INTEGER }
            },
            required: ["id", "text", "difficulty"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      // Ensure IDs are unique-ish if model repeats simple ids
      return parsed.map((q: any, idx: number) => ({
        ...q,
        topic,
        id: `${topic}-${Date.now()}-${idx}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback questions if API fails
    return [
      { id: 'err-1', topic, text: "Hello! How are you today?", difficulty: 1 },
      { id: 'err-2', topic, text: "What is your name?", difficulty: 1 },
      { id: 'err-3', topic, text: "Nice to meet you. Where are you from?", difficulty: 1 }
    ];
  }
};

/**
 * Grades the user's answer.
 */
export const gradeAnswer = async (question: string, answer: string): Promise<Assessment> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an encouraging English teacher for Vietnamese students.
      Question: "${question}"
      Student Answer: "${answer}"
      
      Task:
      1. Correct the grammar/spelling if needed.
      2. Give a score from 0 to 10 based on communicative effectiveness and grammar.
      3. Provide helpful feedback in VIETNAMESE.
      4. Give a short English praise phrase (e.g., "Good job!", "Excellent!").
      
      If the answer is completely irrelevant or Vietnamese, score it low.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            correction: { type: Type.STRING },
            feedback: { type: Type.STRING },
            praise: { type: Type.STRING }
          },
          required: ["score", "correction", "feedback", "praise"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Assessment;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error grading:", error);
    return {
      score: 0,
      correction: "Error grading answer.",
      feedback: "Hệ thống đang bận, vui lòng thử lại sau.",
      praise: "Keep trying!"
    };
  }
};

/**
 * Uses Gemini TTS to read text.
 */
export const speakText = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually a good clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      // Decode and play
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    }
  } catch (error) {
    console.error("TTS Error:", error);
    // Fallback to browser TTS if Gemini fails
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

/**
 * Get cultural context about a topic using Search Grounding
 */
export const getCulturalContext = async (topic: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Tell me a fun fact or cultural tip about "${topic}" in English speaking countries. Keep it short (max 2 sentences) and simple for beginners. Translate to Vietnamese.`,
      config: {
        tools: [{googleSearch: {}}], // Using search grounding as requested
      },
    });
    return response.text || "Learn English to explore the world!";
  } catch (e) {
    return "English is the global language of communication.";
  }
}