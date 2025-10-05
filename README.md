# 🎯 Voice chat Bot

A voice-powered interview assistant that uses AI to conduct real-time interview conversations. Built with Next.js, AssemblyAI for speech-to-text, Google's Gemini AI for intelligent responses, and browser-based text-to-speech.

## ✨ Features

-  **Voice Input**: Record your answers using your microphone
-  **AI-Powered Responses**: Uses Google Gemini AI to generate contextual interview responses
-  **Text-to-Speech**: Browser-based speech synthesis for natural conversation flow
-  **Conversation History**: Maintains context throughout the interview session
-  **Modern UI**: Clean, responsive interface built with Tailwind CSS
-  **Real-time Transcription**: Powered by AssemblyAI for accurate speech recognition

## 🏗️ Architecture

<img width="1598" height="1450" alt="diagram-export-05-10-2025-13_08_47" src="https://github.com/user-attachments/assets/d92a8144-e767-41a7-a243-4d89855aa87b" />


### Flow Diagram

The application follows this sequence:

1. **Initial Greeting**: On mount, the bot greets the user with an introduction
2. **User Interaction**: User clicks "Start Recording" to answer questions
3. **Audio Capture**: Browser MediaRecorder API captures audio in WebM format
4. **Transcription**: Audio is sent to AssemblyAI for speech-to-text conversion
5. **AI Processing**: Transcribed question is sent to Gemini AI with conversation history
6. **Response Generation**: Gemini generates a contextual response based on personal info
7. **Speech Output**: Browser's Speech Synthesis API reads the response aloud
8. **History Update**: Conversation is stored for contextual follow-up questions

##  Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **MediaRecorder API** - Audio recording
- **Web Speech API** - Text-to-speech

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **AssemblyAI** - Speech-to-text transcription
- **Google Gemini AI** - Natural language generation
- **Node.js** - Runtime environment

##  Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- AssemblyAI API Key ([Get it here](https://www.assemblyai.com/))
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Hrithik-12/voice-chat-bot.git
cd voice-chat-bot/voice-bott
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

### 4. Customize personal information

Edit `lib/personal-info.ts` to include your own background, skills, and interview answers.

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

##  Project Structure

```
voice-bott/
├── app/
│   ├── api/
│   │   └── interview/
│   │       └── route.ts          # API endpoint for interview processing
│   ├── components/
│   │   └── InterviewBot.tsx      # Main interview bot component
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/
│   └── personal-info.ts          # Personal information and interview answers
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

##  Key Components

### InterviewBot Component (`app/components/InterviewBot.tsx`)

The main React component that handles:
- Audio recording via MediaRecorder API
- State management (idle, listening, thinking, speaking)
- API communication with the backend
- Text-to-speech synthesis
- UI rendering and user interactions

### Interview API Route (`app/api/interview/route.ts`)

Server-side API that processes:
- Audio transcription using AssemblyAI
- AI response generation using Gemini
- Conversation history management
- Session handling

### Personal Info (`lib/personal-info.ts`)

Contains structured information used by Gemini AI:
- Background and experience
- Skills and projects
- Interview question responses
- Personality traits

##  Configuration

### Gemini AI Settings

Adjust the model parameters in `app/api/interview/route.ts`:

```typescript
const model = genai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,    // Creativity (0-1)
    topP: 0.8,          // Nucleus sampling
    topK: 40,           // Top-k sampling
    maxOutputTokens: 300, // Response length
  }
});
```

### Speech Synthesis Settings

Modify TTS settings in `InterviewBot.tsx`:

```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;    // Speed (0.1-10)
utterance.pitch = 1;     // Pitch (0-2)
utterance.volume = 1;    // Volume (0-1)
```

##  Deployment

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hrithik-12/voice-chat-bot)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add these in your deployment platform:
- `GEMINI_API_KEY`
- `ASSEMBLYAI_API_KEY`

## Customization

### Update Sample Questions

Edit the `SAMPLE_QUESTIONS` array in `InterviewBot.tsx`:

```typescript
const SAMPLE_QUESTIONS = [
  "Your question 1?",
  "Your question 2?",
  // Add more questions
];
```

### Change Theme Colors

Modify Tailwind classes in `InterviewBot.tsx` or update `tailwind.config.ts`.

##  Troubleshooting

### Microphone Access Denied
- Ensure your browser has microphone permissions enabled
- Check that you're using HTTPS in production (required for MediaRecorder API)

### API Errors
- Verify your API keys are correctly set in `.env.local`
- Check API key quotas and limits
- Review console logs for detailed error messages

### Transcription Issues
- Speak clearly and reduce background noise
- Ensure stable internet connection
- Check AssemblyAI service status

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

##  Author

**Hrithik Garg**
- GitHub: [@Hrithik-12](https://github.com/Hrithik-12)
- LinkedIn: [Hrithik Garg](https://www.linkedin.com/in/hrithikgarg1/)

##  Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [AssemblyAI](https://www.assemblyai.com/) - Speech-to-Text API
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI Model
- [Lucide](https://lucide.dev/) - Icon Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework



---

Thank you !!
