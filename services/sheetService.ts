import { QuestionResult, User } from "../types";

/**
 * In a real application, this would point to a Google Apps Script Web App URL.
 * The Apps Script would handle the `doPost` to append rows to a Google Sheet.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; 

export const syncProgressToSheet = async (user: User, result: QuestionResult) => {
  const payload = {
    timestamp: new Date().toISOString(),
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    topic: "Greetings", // Or dynamic
    question: result.questionText,
    answer: result.userAnswer,
    score: result.assessment.score,
    correction: result.assessment.correction,
    feedback: result.assessment.feedback
  };

  console.log("------------------------------------------------");
  console.log("Simulating Sync to Google Sheet:", payload);
  console.log("Target URL (Mock):", GOOGLE_SCRIPT_URL);
  console.log("------------------------------------------------");

  // Code for real implementation:
  /*
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Google Apps Script often requires no-cors for simple POSTs
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to sync to sheet", error);
  }
  */
  
  return true;
};