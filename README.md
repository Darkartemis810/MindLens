# MindLens – AI Student Wellbeing Analyzer

MindLens is a modern, AI-powered student wellbeing companion designed to help students track and improve their mental health. Built with a focus on premium GenZ aesthetics (glassmorphism, soft gradients, dynamic drop-shadows, and smooth micro-animations), the application offers interactive tools like journaling, real-time mood tracking, burnout analysis, and a supportive AI chatbot.

## Core Features & Capabilities

### 1. Real-Time Mood Camera
Get an instant reading of your facial expressions and emotional state right from your browser.
- **How it works:** Leverages the native `navigator.mediaDevices.getUserMedia` API securely. It integrates the powerful `face-api.js` library utilizing `tinyFaceDetector` and `faceExpressionNet` models to process facial landmarks locally.
- **Accuracy:** The camera accurately maps micro-expressions against 7 core emotions (Happy, Sad, Angry, Surprised, Neutral, Fearful, Disgusted) in real-time, outputting dynamic confidence percentages.
- **Data Privacy:** Video streams and image data never leave the client device. Detected mood strings can be explicitly saved to the database.

### 2. Algorithmic Burnout Questionnaire
A structured psychological assessment with clinical precision.
- **How it works:** Users answers a rotating daily pool of 8 randomly-seeded questions on a 5-point Likert scale (Never to Always).
- **Diagnostics:** Utilizes weighted reverse-scoring logic calibrated over a 40-point index. Yields 4 definitive burnout risk bands (*Excellent Focus & Calm*, *Mild Strain*, *Moderate Coping Risk*, *High Burnout Risk*).

### 3. Voice-Enabled AI Journaling
A safe space to write about daily experiences with automated AI sentiment analysis.
- **Voice Dictation:** Users can directly type their thoughts or utilize the **Voice Input** feature powered natively by the Web Speech API. Supports seamless dictation in English (US/India) and Hindi.
- **Supabase Edge Analysis:** Upon saving, the journal text is sent to our Supabase Edge function interfacing with the Google Gemini-3-flash model. It evaluates psychological parameters to return sentiment, primary emotion, a mood score (1-10), and tracks burnout-related keywords.
- **Emergency Safety:** Actively monitors text input for critical distress signals and instantly invokes an unmissable Emergency Alert System with crisis lifelines if necessary.

### 4. Empathetic AI Chatbot
The Chatbot serves as a supportive companion for navigating academic stress or general burnout. 
- **How it works:** Real-time streaming interface hooked into Gemini through Supabase Edge Functions. It utilizes `react-markdown` and `remark-gfm` to perfectly parse and render rich text, structured lists, and bold highlighting.

### 5. Personalized Dashboard & Theming
- **Visual Hub:** An interactive dashboard featuring frosted glassmorphic cards summarizing wellbeing metrics, sleep/study/screen-time caps, recent journal entries, and progress.
- **Global Theming:** Comprehensive `ThemeProvider` enabling ubiquitous localized switching between Light, Dark, and System display modes. 

## Technology Stack

**Frontend Architecture:**
- **Core Framework:** React 18, TypeScript, Vite
- **Routing:** React Router v6
- **State & Data Fetching:** React Query, Supabase JS Client

**UI/UX & Styling:**
- **CSS Framework:** Tailwind CSS (with arbitrary value classes and modern typography utilities)
- **Component Library:** shadcn/ui paired with Radix UI Primitives (Accordion, Dialog, Slider, etc.)
- **Icons & Animations:** Lucide React, Tailwind CSS Animate, Embla Carousel

**Backend, AI & Machine Learning:**
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Serverless Compute:** Supabase Edge Functions (Deno)
- **Generative AI:** Google Gemini Models
- **Computer Vision:** `face-api.js` (Client-side localized face detection payload)
- **Native Web APIs:** Web Speech API (Voice-to-Text)

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
   *Note: Application runs locally on port 8080 depending on configuration.*
