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

  const trainingTexts = [
    '🤖 Teaching chatbot...',
    '📚 Processing documents...',
    '🧠 Building understanding...',
    '⚡ Extracting knowledge...',
    '🔍 Analyzing content...',
    '✨ Finalizing ingestion...',
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
  }, [isVisible, status?.status]);

  // Poll job status
  useEffect(() => {
    if (!isVisible || !jobId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/ingest/jobs/status/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch status');

        const data = await response.json();
        setStatus(data);

        // Call onComplete when done
        if (data.status === 'completed' && onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching job status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [isVisible, jobId, onComplete]);

  if (!isVisible || !status) return null;

  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';
  const isProcessing = status.status === 'processing' || status.status === 'pending';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Ingesting File</h3>
            <p className="text-sm text-gray-600 truncate">{fileName}</p>
          </div>
          {!isProcessing && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {isProcessing && (
          <>
            {/* Training text animation */}
            <div className="text-center py-4">
              <p className="text-base font-medium text-slate-700 min-h-[1.5em]">
                {trainingTexts[textIndex]}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-blue-600">{status.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>

            {/* Elapsed time */}
            <div className="text-center text-sm text-gray-500">
              Time elapsed: {formatTime(elapsedTime)}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                <p className="text-xs text-slate-300 font-semibold mb-3">
                  💡 While we&apos;re training:
                </p>
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
            </div>
          </>
        )}

        {/* Success state */}
        {isCompleted && (
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">✅</div>
            <div>
              <p className="font-semibold text-gray-900">Ingestion Complete!</p>
              <p className="text-sm text-gray-600">
                {status.documents_count || 0} documents processed
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Failed state */}
        {isFailed && (
          <div className="text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <div>
              <p className="font-semibold text-gray-900">Ingestion Failed</p>
              <p className="text-sm text-red-600">{status.error || 'Unknown error'}</p>
            </div>
            <button
              onClick={onDismiss}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
