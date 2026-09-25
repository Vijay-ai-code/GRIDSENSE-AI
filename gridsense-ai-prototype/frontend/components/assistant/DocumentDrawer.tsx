'use client';

import React from 'react';
import { X, BookOpen, FileText, CheckCircle } from 'lucide-react';
import { RAGSource } from '../../lib/types';

interface DocumentDrawerProps {
  source: RAGSource | null;
  onClose: () => void;
}

export function DocumentDrawer({ source, onClose }: DocumentDrawerProps) {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#091524] p-6 shadow-2xl space-y-5">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{source.documentTitle}</h2>
              <p className="text-xs text-cyan-300 font-medium">{source.sectionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Relevance Badge */}
        <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-xs">
          <span className="text-slate-400">Semantic Relevance Score:</span>
          <span className="font-mono font-bold text-cyan-300">{source.relevanceScore}% Match</span>
        </div>

        {/* Full Retrieved Context Text */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Retrieved Reference Excerpt (Grounding Document):</span>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
            {source.fullText || source.snippet}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
}
