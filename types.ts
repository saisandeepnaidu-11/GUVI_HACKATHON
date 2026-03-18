
export enum VoiceClassification {
  AI_GENERATED = 'AI-Generated',
  HUMAN_GENERATED = 'Human-Generated'
}

export interface DetectionResult {
  classification: VoiceClassification;
  confidenceScore: number;
  explanation: string;
  detectedLanguage: string;
  artifacts: string[];
  spectralAnomalies: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: DetectionResult;
  language: string;
  audioName: string;
}

export type SupportedLanguage = 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu' | 'Auto-Detect';

export interface AppState {
  isProcessing: boolean;
  result: DetectionResult | null;
  error: string | null;
  selectedLanguage: SupportedLanguage;
  history: HistoryItem[];
}
