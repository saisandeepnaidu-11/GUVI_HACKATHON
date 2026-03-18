# VoxVeritas - AI Voice Forensic Detector

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

VoxVeritas is an advanced AI Voice Forensic Detector built to analyze audio samples and determine if they are authentic human speech or AI-generated deepfakes. It leverages the power of Google's Gemini Pro AI to perform deep spectral and linguistic analysis across multiple languages.

## 🌟 Features

- **Multi-language Support**: Detects nuances in English, Tamil, Hindi, Malayalam, and Telugu.
- **Real-time Voice Capture**: Record audio directly from your microphone for instant analysis.
- **Audio File Upload**: Upload existing audio files (MP3, WAV, WebM) for scanning.
- **Deep AI Analysis**: Utilizes Gemini AI to detect spectral gaps, prosodic anomalies, and synthetic linguistic markers.
- **Detailed Forensic Reports**: View confidence scores, specific acoustic markers, and spectral anomaly details.
- **Scan History**: Keep track of previous analyses in a secure, session-based history console.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Google Gemini API Key

### Installation

1.  **Clone the repository or navigate to the project directory.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory (if it doesn't exist) and add your Gemini API Key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Note: The project is currently configured to also accept `GEMINI_API_KEY` in `vite.config.ts`, but using the `VITE_` prefix is the standard Vite approach.*
4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
5.  **Access the Application**:
    Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:3000` or `http://localhost:5173`).

## 🧠 How it Works

VoxVeritas analyzes audio based on several advanced forensic parameters:
1.  **Linguistic Context**: Evaluates phonetic transitions specific to the chosen language (e.g., retroflex consonants in Dravidian languages).
2.  **Spectral Markers**: Scans for "spectral gaps" and the absence of natural physiological variations like micro-tremors in vowels.
3.  **Prosodic Analysis**: Checks breathing patterns, speech rate fluidity, and high-frequency digital artifacts.

## 🛠️ Built With

*   **Frontend Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Framer Motion
*   **Icons**: Lucide React
*   **Data Visualization**: Recharts
*   **AI Engine**: Google Gen AI SDK (`@google/genai`)

## ⚠️ Disclaimer

This tool is a prototype designed for educational and forensic demonstration purposes. While it uses advanced AI models for detection, it may not perfectly identify all instances of AI-generated audio or deepfakes. It should be used as part of a broader investigative process.
