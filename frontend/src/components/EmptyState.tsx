import React from 'react';
import { Sparkles, BookOpen, Layers, Cpu, ArrowUpRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    title: 'Transformer Architecture',
    prompt: 'What are the key components of the Transformer model in "Attention Is All You Need"?',
    icon: Layers,
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400',
  },
  {
    title: 'RAG Paradigm',
    prompt: 'How does Retrieval-Augmented Generation combine parametric and non-parametric memory?',
    icon: Sparkles,
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400',
  },
  {
    title: 'BERT Pre-training',
    prompt: 'Explain the Masked Language Model (MLM) and Next Sentence Prediction (NSP) tasks used in BERT.',
    icon: Cpu,
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
  },
  {
    title: 'Self-Attention vs RNNs',
    prompt: 'What advantages does self-attention offer over recurrent networks regarding computational complexity?',
    icon: BookOpen,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        <span>RAG Research Assistant Powered by Gemini 2.5 Flash</span>
      </div>

      {/* Main Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          What would you like to explore?
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Ask questions across your indexed research papers. Answers are grounded in the document context and cite their exact sources.
        </p>
      </div>

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 hover:scale-[1.01] hover:border-indigo-500/40 group flex flex-col justify-between ${item.color} bg-slate-900/60`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.title}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                "{item.prompt}"
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

