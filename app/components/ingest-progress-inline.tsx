'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobStatus {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  documents_count?: number;
}

interface ProgressProps {
  isVisible: boolean;
  jobId?: string;
  fileName?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function IngestProgressInline({
  isVisible,
  jobId,
  fileName,
  onComplete,
  onDismiss,
}: ProgressProps) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [textIndex, setTextIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const trainingTexts = [
    '🤖 Teaching chatbot to understand...',
    '📚 Processing your documents...',
    '🧠 Building AI knowledge base...',
    '⚡ Extracting key information...',
    '🔍 Analyzing content patterns...',
    '✨ Finalizing your training data...',
  ];

  // Animate training text
  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % trainingTexts.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isVisible, trainingTexts.length]);

  // Track elapsed time
  useEffect(() => {
    if (!isVisible || !status || status.status === 'completed' || status.status === 'failed') return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isVisible, status]);

  // Poll job status
  useEffect(() => {
    if (!isVisible || !jobId) return;

    const fetchStatus = async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) headers["Authorization"] = `Bearer ${token}`;
        }
        
        // Get backend URL from environment or use current origin
        let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
          (typeof window !== "undefined" ? window.location.origin : "");
        
        // Remove trailing slash to avoid double slashes
        backendUrl = backendUrl.replace(/\/$/, "");
        
        const url = `${backendUrl}/api/ingest/jobs/status/${jobId}`;
        const response = await fetch(url, { headers });
        
        if (!response.ok) throw new Error(`Failed to fetch status: ${response.status}`);

        const data = await response.json();
        setStatus(data);

        // Call onComplete when done
        if (data.status === 'completed' && onComplete) {
          setShowCelebration(true);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      } catch {
        // Silently fail - endpoint might not be ready yet
      }
    };

    fetchStatus();  // Initial fetch immediately
    const interval = setInterval(fetchStatus, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isVisible, jobId, onComplete]);

  if (!isVisible) return null;

  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';
  const isProcessing = !status || status?.status === 'processing' || status?.status === 'pending';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(720deg);
            opacity: 0;
          }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .slide-down { animation: slide-down 0.5s ease-out; }
        .confetti-piece {
          animation: confetti 3s ease-out forwards;
          position: fixed;
          pointer-events: none;
        }
      `}</style>

      {/* Confetti effect */}
      {isCompleted && showCelebration && (
        <>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: '50%',
                top: '50%',
                '--tx': `${(Math.random() - 0.5) * 200}px`,
                '--ty': `${-200 + Math.random() * 100}px`,
              } as React.CSSProperties}
            >
              {['🎉', '✨', '🎊', '⭐', '🚀'][i % 5]}
            </div>
          ))}
        </>
      )}

      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 w-full shadow-lg slide-down mb-6">
        
        {/* Processing state */}
        {isProcessing && (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center pulse-glow">
                  <div className="text-3xl float-animation">⚙️</div>
                </div>
              </div>
              <h3 className="font-bold text-2xl text-gray-900">Training Your Chatbot</h3>
              <p className="text-sm text-gray-600 mt-2 truncate max-w-xs mx-auto">{fileName}</p>
            </div>

            {/* Training text animation */}
            <div className="text-center py-4 min-h-12 flex items-center justify-center">
              <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {trainingTexts[textIndex]}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {status?.progress || 0}%
                </span>
              </div>
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${status?.progress || 0}%` }}
                />
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            {/* Time and stats */}
            <div className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3 mb-6">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-600">Time Elapsed</p>
                <p className="text-lg font-bold text-blue-600">{formatTime(elapsedTime)}</p>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center flex-1">
                <p className="text-xs text-gray-600">Status</p>
                <p className="text-lg font-bold text-purple-600">Processing...</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-indigo-900 mb-3 flex items-center">
                💡 While We Train
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg transition-all font-semibold text-center shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  📊 Explore Dashboard
                </Link>
                <Link
                  href="/bots"
                  className="text-xs bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg transition-all font-semibold text-center shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  🎨 Customize Chatbot
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Success state */}
        {isCompleted && (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-bounce shadow-lg">
                  <span className="text-5xl">✨</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                We&apos;ve Trained Your Chatbot!
              </h2>
              <p className="text-gray-600">
                {status?.documents_count || 0} documents have been successfully processed and integrated into your chatbot&apos;s knowledge base.
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">✓ Your chatbot is now equipped with:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ {status?.documents_count || 0} trained documents</li>
                <li>✓ Advanced AI understanding</li>
                <li>✓ Ready to answer questions</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={onDismiss}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue →
              </button>
              <Link
                href="/bots"
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all border-2 border-gray-200 hover:border-blue-300 text-center"
              >
                View Your Chatbot
              </Link>
            </div>
          </div>
        )}

        {/* Failed state */}
        {isFailed && (
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-xl text-gray-900">Training Failed</p>
              <p className="text-sm text-red-600 mt-2">{status?.error || 'An unexpected error occurred'}</p>
            </div>
            <button
              onClick={onDismiss}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
