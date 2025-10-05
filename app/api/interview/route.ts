// ============================================
// FILE 2: app/api/interview/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssemblyAI } from 'assemblyai';
import { YOUR_PERSONAL_INFO } from '@/lib/personal-info';

// Initialize APIs
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!
});

// Conversation history store (in production, use Redis/database)
const conversationHistory = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string || 'default';
    const action = formData.get('action') as string;

    // Handle initial greeting
    if (action === 'greeting') {
      const greeting = "Hello! I'm ready for the interview. Please ask me any questions about my background, skills, or experience.";
      
      // Initialize conversation history
      conversationHistory.set(sessionId, [
        { role: 'user', parts: [{ text: YOUR_PERSONAL_INFO }] },
        { role: 'model', parts: [{ text: 'I understand. I will answer all interview questions as you, staying authentic to your background, skills, and personality.' }] }
      ]);

      const audioUrl = await generateSpeech(greeting);
      
      return NextResponse.json({
        question: null,
        answer: greeting,
        audioUrl
      });
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Step 1: Transcribe audio using AssemblyAI
    console.log('Transcribing audio...');
    const audioBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);

    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioData,
    });

    if (transcript.status === 'error') {
      throw new Error('Transcription failed');
    }

    const question = transcript.text || '';
    if (!question) {
      throw new Error('No text transcribed from audio');
    }
    console.log('Question:', question);

    // Step 2: Generate response using Gemini
    console.log('Generating AI response...');
    const model = genai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 300,
      }
    });

    // Get or initialize conversation history
    let history = conversationHistory.get(sessionId) || [
      { role: 'user', parts: [{ text: YOUR_PERSONAL_INFO }] },
      { role: 'model', parts: [{ text: 'I understand. I will answer all interview questions as you.' }] }
    ];

    // Create chat with history
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(question);
    const answer = result.response.text();
    
    console.log('Answer:', answer);

    // Update conversation history
    history.push(
      { role: 'user', parts: [{ text: question }] },
      { role: 'model', parts: [{ text: answer }] }
    );
    conversationHistory.set(sessionId, history);

    // Step 3: Generate speech from answer
    console.log('Generating speech...');
    const audioUrl = await generateSpeech(answer);

    return NextResponse.json({
      question,
      answer,
      audioUrl,
      sessionId
    });

  } catch (error: any) {
    console.error('Error processing interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process interview' },
      { status: 500 }
    );
  }
}

// Generate speech using Web Speech API compatible format
async function generateSpeech(text: string): Promise<string> {
  // For production, use ElevenLabs, Google TTS, or Azure TTS
  // For now, return text that frontend will use with browser's speechSynthesis
  return `data:text/plain;base64,${Buffer.from(text).toString('base64')}`;
}