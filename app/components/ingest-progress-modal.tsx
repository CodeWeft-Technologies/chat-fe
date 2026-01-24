"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProgressModalProps {
  isOpen: boolean;
  jobId?: string;
  fileName?: string;
  onComplete?: (jobId: string) => void;
  onDismiss?: () => void;
}

interface JobStatus {
  id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  documents_count: number;
}

const TrainingTexts = [
  "🤖 Teaching the chatbot your knowledge...",
  "📚 Processing documents...",
  "🧠 Building understanding...",
  "⚡ Optimizing embeddings...",
  "🔍 Extracting key information...",
  "✨ Nearly done...",
];

export function IngestProgressModal({
  isOpen,
  jobId,
  fileName,
  onComplete,
  onDismiss,
}: ProgressModalProps) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate the training text every 2 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % TrainingTexts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Track elapsed time
  useEffect(() => {
    if (!isOpen || status?.status !== "processing") return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, status?.status]);

  // Poll job status
  useEffect(() => {
    if (!isOpen || !jobId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/ingest/jobs/status/${jobId}`);
        if (!response.ok) throw new Error("Failed to fetch status");

        const data = await response.json();
        setStatus(data);
        setLoading(false);

        // Call onComplete when done
        if (data.status === "completed" && onComplete) {
          onComplete(jobId);
        }
      } catch (error) {
        console.error("Error fetching job status:", error);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 1 second
    const interval = setInterval(fetchStatus, 1000);

    return () => clearInterval(interval);
  }, [isOpen, jobId, onComplete]);

  if (!isOpen) return null;

  const displayFileName = fileName || status?.filename || "File";
  const progress = status?.progress || 0;
  const isCompleted = status?.status === "completed";
  const isFailed = status?.status === "failed";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-700/50">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isFailed ? "⚠️ Processing Failed" : isCompleted ? "✅ Training Complete!" : "🚀 Training Your Chatbot"}
          </h2>
          <p className="text-slate-400 text-sm truncate">{displayFileName}</p>
        </div>

        {/* Progress Section */}
        {!isCompleted && !isFailed && (
          <>
            {/* Animated Training Text */}
            <div className="mb-6 h-8 overflow-hidden">
              <div
                className="transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateY(-${textIndex * 32}px)`,
                }}
              >
                {TrainingTexts.map((text, idx) => (
                  <div key={idx} className="h-8 flex items-center text-sm font-medium text-blue-400 animate-pulse">
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Progress</span>
                <span className="text-sm font-bold text-blue-400">{progress}%</span>
              </div>

              {/* Outer glow effect */}
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                {/* Inner shadow */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full opacity-50"></div>

                {/* Progress fill with gradient and animation */}
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/50"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Time elapsed */}
            <div className="flex justify-between items-center text-xs text-slate-400 mb-6">
              <span>⏱️ Time elapsed</span>
              <span className="font-mono font-semibold text-slate-300">{formatTime(elapsedTime)}</span>
            </div>

            {/* Pulsing Dots */}
            <div className="flex gap-2 justify-center mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{
                    animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                ></div>
              ))}
            </div>
          </>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <div className="text-6xl animate-bounce">✅</div>
            </div>
            <div>
              <p className="text-xl font-bold text-white mb-1">Successfully ingested!</p>
              <p className="text-sm text-slate-400">
                {status?.documents_count || 0} documents added to your chatbot
              </p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <div className="text-6xl">⚠️</div>
            </div>
            <div>
              <p className="text-sm text-red-400 font-mono break-words">{status?.error || "Unknown error occurred"}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isCompleted && !isFailed && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
              <p className="text-xs text-slate-300 font-semibold mb-3">💡 While we're training:</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg transition-colors text-center font-medium"
                >
                  Explore Dashboard
                </Link>
                <Link
                  href="/bots"
                  className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg transition-colors text-center font-medium"
                >
                  Customize Chatbot Style
                </Link>
              </div>
            </div>
          )}

          {(isCompleted || isFailed) && (
            <button
              onClick={onDismiss}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isCompleted ? "Continue to Dashboard" : "Try Again"}
            </button>
          )}
        </div>

        {/* Close button */}
        {!isCompleted && !isFailed && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
