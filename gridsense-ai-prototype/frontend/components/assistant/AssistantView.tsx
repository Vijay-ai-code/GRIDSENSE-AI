'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  BookOpen,
  Sparkles,
  FileText,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { queryAssistant } from '../../lib/api';
import { ChatMessage, RAGSource } from '../../lib/types';
import { DocumentDrawer } from './DocumentDrawer';

const SUGGESTED_QUESTIONS = [
  'Why does renewable penetration affect grid stability?',
  'What is frequency stability and rotational inertia?',
  'What is voltage stability and reactive power?',
  'Why is reactive power (VAR) important in renewable integration?',
  'What happens when total generation is lower than demand?',
  'How do BESS and grid-forming inverters synthesize virtual inertia?'
];

export function AssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        'Hello! I am the GridSense AI Knowledge Assistant. I can explain complex power-system stability concepts, IEEE 1547 standards, the Duck Curve phenomenon, and renewable integration dynamics based on verified domain literature.',
      sources: []
    }
  ]);
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RAGSource | null>(null);

  const handleSend = async (question: string) => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryText('');
    setIsLoading(true);

    try {
      const res = await queryAssistant(question);
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error querying knowledge base: ${err.message || 'Service unavailable.'}`,
        sources: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">GridSense AI Assistant</h1>
          <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-400/20">
            RAG ARCHITECTURE
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Ask questions about grid stability, renewable integration, and power system dynamics grounded in IEEE/NERC engineering literature.
        </p>
      </div>

      {/* Architectural Explanation Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-3">
        <Cpu className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">RETRIEVAL-AUGMENTED GENERATION (RAG) PIPELINE:</span> User inquiries trigger semantic chunk matching against indexed technical standards (`rag-service/documents/`). Grounded context excerpts are synthesized and displayed alongside source attribution badges.
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Suggested Technical Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="rounded-xl border border-slate-800 bg-[#0b1929] px-3.5 py-2 text-left text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-900 transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1929] shadow-xl flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500 text-slate-950 font-medium'
                      : 'border border-slate-800 bg-slate-950/70 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Sources Citations for Assistant Answers */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-cyan-400" />
                        <span>Referenced Engineering Sources (Click to inspect excerpt):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => setSelectedSource(src)}
                            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-300 hover:bg-cyan-500/20 transition font-medium"
                          >
                            <span>{src.documentTitle.split(':')[0]}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({src.relevanceScore}%)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Searching technical corpus and synthesizing answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-900/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(queryText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask a technical question about grid inertia, frequency, or voltage control..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isLoading || !queryText.trim()}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Ask Assistant</span>
            </button>
          </form>
        </div>
      </div>

      {/* Grounding Document Inspection Drawer */}
      <DocumentDrawer source={selectedSource} onClose={() => setSelectedSource(null)} />
    </div>
  );
}
