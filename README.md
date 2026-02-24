# MindLens – AI Student Wellbeing Analyzer

MindLens is an AI-powered student wellbeing companion designed to help students track and improve their mental health. Built with a focus on premium aesthetics (glassmorphism, soft gradients, smooth animations), the application offers interactive tools like journaling, mood tracking, and a supportive AI chatbot.

## Core Features & Implementation Details

### 1. AI Chatbot
The Chatbot serves as a supportive, empathetic companion for students experiencing stress or burnout. 
- **How it works:** Users interact with a floating chat interface. The messages are streamed in real-time using Supabase Edge Functions connecting to Google's Gemini-3-flash-preview model.
- **Tech Stack:** React Markdown is utilized for rendering rich text, list formatting, and applying markdown structure perfectly within chat bubbles.
- **Safety Trigger:** Built-in client-side keyword interception scans for emergency phrases (e.g., "suicide", "want to die"). If triggered, it instantly presents an unmissable Emergency Alert modal with direct, clickable links to the National Crisis Lifeline (988) and Local Emergency Police (911).

### 2. Mood Camera Tracker
The Mood Camera allows users to get an instant reading of their facial expressions and emotional state.
- **How it works:** Leverages the native `navigator.mediaDevices.getUserMedia` API to securely access the user's webcam and process the video stream entirely in the browser. Emulated emotion detection randomly cycles through 7 standard emotions (happy, sad, angry, surprised, neutral, fearful, disgusted), assigning a confidence score.
- **Data Privacy:** Video streams are strictly kept local and immediately discarded when navigating away using React Component cleanup hooks. Detected moods can be saved manually to the Supabase database.

### 3. Voice-Enabled Journaling
A safe space to write about daily experiences with automated AI sentiment analysis.
- **How it works:** Users can directly type their thoughts or utilize the **Voice Input** feature powered by the native Web Speech API. The continuous dictation seamlessly handles transcription and supports English (US/India) and Hindi dialects.
- **AI Analysis:** Upon saving, the journal text is sent to the backend. The Edge Function evaluates the entry against psychological parameters to return the current sentiment, primary emotion, a 1-10 mood score, and specific keywords related to stress/burnout.
- **Safety Trigger:** Similarly to the Chatbot, the Journal actively monitors text input for critical distress signals and invokes the Emergency Alert System if necessary.

### 4. Burnout Questionnaire & Dashboard
- **Questionnaire:** A structured psychological assessment. Users answer scaled questions and the application calculates a personalized burnout risk profile, identifying specific areas like Emotional Exhaustion or Depersonalization.
- **Dashboard:** An interactive visual hub featuring glassmorphic cards that summarize the user's wellbeing metrics, recently acquired journal entries, and general progress over time.
- **Dark Mode:** A comprehensive custom ThemeProvider enables users to switch the entire application between light, dark, and system-defined themes with a persistent local storage state.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, React Router
- **Styling:** Tailwind CSS, shadcn-ui UI components, native CSS variables
- **Backend & Database:** Supabase (PostgreSQL), RESTful APIs, Edge Functions
- **AI Integration:** Google Gemini Models, Web Speech API

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Darkartemis810/mindful-lens.git
   cd mindful-lens
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run the local development server:**
   ```sh
   npm run dev
   ```
