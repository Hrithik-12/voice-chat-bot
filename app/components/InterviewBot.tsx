// ============================================
// FILE 3: components/InterviewBot.tsx
// ============================================
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, AlertCircle } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  "What should we know about your life story in a few sentences?",
  "What's your #1 superpower?",
  "What are the top 3 areas you'd like to grow in?",
  "What misconception do your coworkers have about you?",
  "How do you push your boundaries and limits?"
];

export default function InterviewBot() {
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Load initial greeting
    loadGreeting();
  }, []);

  const loadGreeting = async () => {
    try {
      const formData = new FormData();
      formData.append('action', 'greeting');
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/interview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      setTranscript([{ role: 'assistant', text: data.answer }]);
      await speakText(data.answer);
    } catch (err) {
      console.error('Failed to load greeting:', err);
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('listening');
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('thinking');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus('thinking');
      
      // Send audio to backend
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/interview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      
      // Update transcript with question and answer
      setTranscript(prev => [
        ...prev,
        { role: 'user', text: data.question },
        { role: 'assistant', text: data.answer }
      ]);
      
      // Speak the answer
      setStatus('speaking');
      await speakText(data.answer);
      setStatus('idle');
      
    } catch (err: any) {
      setError(err.message || 'Failed to process audio. Please try again.');
      setStatus('idle');
      console.error('Error processing audio:', err);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          icon: <Mic className="w-6 h-6 animate-pulse" />,
          text: 'Listening...',
          color: 'bg-red-500',
        };
      case 'thinking':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          text: 'Processing...',
          color: 'bg-yellow-500',
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-6 h-6 animate-pulse" />,
          text: 'Speaking...',
          color: 'bg-green-500',
        };
      default:
        return {
          icon: <Mic className="w-6 h-6" />,
          text: 'Ready',
          color: 'bg-blue-500',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 100x AI Interview Bot
          </h1>
          <p className="text-gray-600">
            Voice-powered interview assistant for Hrithik Garg
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`${statusConfig.color} rounded-full p-3 text-white shadow-lg`}>
            {statusConfig.icon}
          </div>
          <span className="text-lg font-semibold text-gray-700">
            {statusConfig.text}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Sample Questions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💡 Sample Questions:
          </h3>
          <ul className="space-y-2">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Conversation</h3>
          <div className="space-y-4">
            {transcript.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-indigo-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Control */}
        <div className="flex justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={status !== 'idle'}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <Mic className="w-6 h-6" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 animate-pulse"
            >
              <Square className="w-6 h-6" />
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}