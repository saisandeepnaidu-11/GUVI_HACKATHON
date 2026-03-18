
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, VoiceClassification, SupportedLanguage } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export async function analyzeAudio(
  base64Audio: string,
  mimeType: string,
  targetLanguage: SupportedLanguage
): Promise<DetectionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a world-class audio forensic expert specialized in detecting synthetic voice vs. authentic human speech across major world languages.
    
    CRITICAL ANALYSIS PARAMETERS:
    1. Linguistic Context: You must evaluate phonetic transitions specific to Tamil, English, Hindi, Malayalam, and Telugu. 
       - Human speech in Dravidian languages (Tamil, Telugu, Malayalam) has specific retroflex consonant patterns and vowel elongations that AI often struggles to replicate naturally.
       - Hindi human speech features nuanced aspiration and schwa-deletion that synthetic models often "over-correct."
    
    2. Spectral Forensic Markers:
       - AI voices often show "spectral gaps" or unnaturally uniform harmonics above 8kHz.
       - Look for the absence of natural micro-tremors (physiological jitter/shimmer) in sustained vowels.
       - Check for "unnatural silences" where the background noise floor drops to absolute zero between syllables, a classic marker of TTS.

    3. Prosodic Analysis:
       - Humans take breaths at logical linguistic breaks. Synthetic voices often ignore these or add generic "simulated" breaths that don't match the linguistic intensity.
       - Metallic timber or robotic "clipping" in high frequencies.

    4. REDUCING FALSE POSITIVES (IMPORTANT):
       - If the audio has natural background noise (hiss, room tone, distant sounds) that is consistent and integrated with the voice, it is highly likely HUMAN.
       - Natural "imperfections" like slight stutters, "um/ah" fillers, and varying speech rates are strong human indicators.
       - AI models often sound "too perfect" or have a "sterile" quality. If the voice sounds slightly muffled or has low-quality microphone characteristics, do not automatically assume it's AI; look for the underlying neural patterns.
       - Be conservative: Only classify as 'AI-Generated' if there are clear, multiple synthetic artifacts. If unsure, lean towards 'Human-Generated' but with a lower confidence score.

    OUTPUT INSTRUCTIONS:
    - Respond strictly in JSON format matching the defined schema.
    - Provide a technical, forensic-style explanation.
    - Classification must be exactly 'AI-Generated' or 'Human-Generated'.
  `;

  const prompt = `Perform a forensic audit on this audio. The primary language context is ${targetLanguage}. Identify if the sample is a deepfake/AI-generated or an authentic human recording. Provide high-fidelity reasoning.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              description: "Must be exactly 'AI-Generated' or 'Human-Generated'",
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Confidence percentage from 0 to 100",
            },
            explanation: {
              type: Type.STRING,
              description: "Technical forensic report explanation",
            },
            detectedLanguage: {
              type: Type.STRING,
              description: "The primary language detected in the sample",
            },
            artifacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific linguistic/acoustic synthetic markers",
            },
            spectralAnomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Technical frequency/waveform deviations detected",
            }
          },
          required: ["classification", "confidenceScore", "explanation", "detectedLanguage", "artifacts", "spectralAnomalies"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as DetectionResult;
  } catch (error: any) {
    console.error("Forensic Engine Error:", error);
    
    const errorMessage = error?.message || "";
    
    if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not found")) {
      throw new Error("AUTHENTICATION_ERROR: The Gemini API key is missing or invalid. Please check your environment configuration in the Settings menu.");
    }
    
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      throw new Error("QUOTA_EXCEEDED: Neural processing limit reached. Please wait a moment before running another forensic scan.");
    }

    if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
      throw new Error("SAFETY_BLOCK: The audio sample was flagged by safety filters. Ensure the content complies with standard usage policies.");
    }

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      throw new Error("NETWORK_ERROR: Connection to the forensic engine timed out. Please check your internet connection and try again.");
    }

    throw new Error("ANALYSIS_FAILED: The neural scan could not be completed. This usually happens if the audio is too short (under 1 second), heavily distorted, or in an unsupported format.");
  }
}
