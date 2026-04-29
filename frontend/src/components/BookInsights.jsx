import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Sparkles, Loader2, Copy, RefreshCw, History, ChevronRight, Check, XCircle, WandSparkles } from 'lucide-react';
import { triggerToast } from './Toast';

const STORAGE_KEY = 'ots_ai_book_notes_history';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const LEVELS = [
  { label: 'School', value: 'school' },
  { label: 'College', value: 'college' },
  { label: 'Exam Prep', value: 'exam-prep' },
  { label: 'Quick Revision', value: 'quick-revision' },
];

const LENGTHS = [
  { label: 'Short', value: 'short' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Detailed', value: 'detailed' },
];

const DEFAULT_FORM = {
  topic: '',
  level: 'college',
  length: 'balanced',
};

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const stripCodeFences = (text) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

const parseAiPayload = (content) => {
  const cleaned = stripCodeFences(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      title: 'AI Study Notes',
      suggestedBooks: [],
      notes: cleaned,
      quickRevision: [],
      practiceQuestions: [],
    };
  }
};

const notePrompt = (topic, level, length) => `Return ONLY valid JSON with this exact structure:
{
  "title": string,
  "suggestedBooks": [string, string, string],
  "notes": string,
  "quickRevision": [string, string, string, string, string],
  "practiceQuestions": [string, string, string]
}

Topic: ${topic}
Student level: ${level}
Depth: ${length}

Rules:
- Infer the most relevant textbooks/reference books for the topic.
- The user does not know book names, so choose them automatically.
- Generate student-friendly notes from those books.
- Keep the notes accurate, concise, and structured.
- notes must be a single markdown-style string with headings like Summary, Core Concepts, Important Terms, and Examples.
- quickRevision should be bite-sized revision bullets.
- practiceQuestions should be questions only, no answers.
- If the topic is broad, focus on the most commonly taught version first.`;

export default function BookInsights() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [notesState, setNotesState] = useState(null);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const recentTopics = useMemo(() => history.slice(0, 6), [history]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateNotes = async (topicOverride = null) => {
    const topic = (topicOverride ?? form.topic).trim();
    if (!topic) {
      triggerToast('Please enter a topic', 'error');
      return;
    }
    if (!GROQ_API_KEY) {
      triggerToast('Missing VITE_GROQ_API_KEY in .env', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.35,
          max_tokens: 1600,
          messages: [
            {
              role: 'system',
              content: 'You generate educational notes from books as structured JSON only. Do not add markdown fences or explanations outside JSON.'
            },
            {
              role: 'user',
              content: notePrompt(topic, form.level, form.length)
            }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to generate notes');
      }

      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('AI returned an empty response');
      }

      const parsed = parseAiPayload(content);
      const payload = {
        id: Date.now().toString(),
        topic,
        level: form.level,
        length: form.length,
        ...parsed,
        createdAt: Date.now(),
      };

      setNotesState(payload);
      setHistory((prev) => [payload, ...prev.filter((item) => item.topic !== topic)]);
      triggerToast('Notes generated', 'success');
    } catch (error) {
      triggerToast(error.message || 'Could not generate notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = async () => {
    if (!notesState) return;
    const text = [
      `Topic: ${notesState.topic}`,
      `Suggested Books: ${notesState.suggestedBooks?.join(', ') || 'AI picked common textbooks'}`,
      '',
      notesState.notes || '',
      '',
      'Quick Revision:',
      ...(notesState.quickRevision || []).map((item) => `- ${item}`),
      '',
      'Practice Questions:',
      ...(notesState.practiceQuestions || []).map((item) => `- ${item}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      triggerToast('Notes copied to clipboard', 'success');
    } catch {
      triggerToast('Clipboard permission denied', 'error');
    }
  };

  const removeHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (notesState?.id === id) setNotesState(null);
  };

  const loadHistoryItem = (item) => {
    setForm((prev) => ({ ...prev, topic: item.topic, level: item.level, length: item.length }));
    setNotesState(item);
    triggerToast(`Loaded notes for ${item.topic}`, 'info');
  };

  return (
    <div className="page-enter max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-border bg-brand-card/90 backdrop-blur-sm mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_32%)]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs mb-4">
                <WandSparkles size={14} className="text-brand-accent" /> AI-powered study notes
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                AI Book Notes
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                You do not need to know the book name. Enter the topic, pick the study level, and Tap2Gyaan will infer the most relevant textbooks, then generate clean revision notes for you.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-white font-black text-xl">{history.length}</div>
                <div className="text-xs text-slate-400 mt-1">Saved</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-brand-accent font-black text-xl">{LEVELS.find((l) => l.value === form.level)?.label}</div>
                <div className="text-xs text-slate-400 mt-1">Level</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-brand-success font-black text-xl">{LENGTHS.find((l) => l.value === form.length)?.label}</div>
                <div className="text-xs text-slate-400 mt-1">Depth</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-[1.3fr,0.7fr,0.7fr,auto]">
            <input
              type="text"
              value={form.topic}
              onChange={(e) => updateForm('topic', e.target.value)}
              placeholder="Enter topic: Cell cycle, Trigonometry, OS, Photosynthesis..."
              className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all"
            />

            <select
              value={form.level}
              onChange={(e) => updateForm('level', e.target.value)}
              className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white focus:outline-none focus:border-brand-accent transition-all"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>

            <select
              value={form.length}
              onChange={(e) => updateForm('length', e.target.value)}
              className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white focus:outline-none focus:border-brand-accent transition-all"
            >
              {LENGTHS.map((len) => (
                <option key={len.value} value={len.value}>{len.label}</option>
              ))}
            </select>

            <button
              onClick={() => generateNotes()}
              disabled={loading || !form.topic.trim()}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Generating' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr,0.65fr] gap-6 items-start">
        <div className="space-y-6">
          {notesState ? (
            <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-brand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-brand-accent text-xs uppercase tracking-[0.2em] mb-2">
                    <BookOpen size={14} /> AI study pack
                  </div>
                  <h2 className="text-2xl font-black text-white">{notesState.title || notesState.topic}</h2>
                  <p className="text-sm text-slate-400 mt-1">Topic: {notesState.topic} • {LEVELS.find((l) => l.value === notesState.level)?.label} • {LENGTHS.find((l) => l.value === notesState.length)?.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyNotes}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    onClick={() => generateNotes(notesState.topic)}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Suggested Books</p>
                  <div className="flex flex-wrap gap-2">
                    {(notesState.suggestedBooks?.length ? notesState.suggestedBooks : ['AI selected the most relevant textbooks automatically']).map((book) => (
                      <span key={book} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-bg border border-brand-border text-sm text-slate-200">
                        <BookOpen size={14} className="text-brand-accent" /> {book}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                    <div className="flex items-center gap-2 mb-3 text-white font-semibold">
                      <Sparkles size={16} className="text-brand-accent" /> Notes
                    </div>
                    <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{notesState.notes}</div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                      <div className="flex items-center gap-2 mb-3 text-white font-semibold">
                        <Check size={16} className="text-brand-success" /> Quick Revision
                      </div>
                      <ul className="space-y-2">
                        {(notesState.quickRevision || []).map((item, index) => (
                          <li key={`${item}-${index}`} className="flex gap-2 text-sm text-slate-300">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                      <div className="flex items-center gap-2 mb-3 text-white font-semibold">
                        <ChevronRight size={16} className="text-brand-accent" /> Practice Questions
                      </div>
                      <ul className="space-y-2">
                        {(notesState.practiceQuestions || []).map((item, index) => (
                          <li key={`${item}-${index}`} className="flex gap-2 text-sm text-slate-300">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-success shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-border bg-brand-card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-brand-border flex items-center justify-center">
                <BookOpen size={28} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No notes generated yet</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Enter a topic and let AI infer the right books, then generate structured study notes for you.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-brand-border bg-brand-card p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <History size={16} className="text-brand-accent" /> Recent Topics
            </div>
            {recentTopics.length === 0 ? (
              <p className="text-sm text-slate-400">Your generated notes will appear here.</p>
            ) : (
              <div className="space-y-2">
                {recentTopics.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left rounded-2xl border border-brand-border bg-brand-bg/70 hover:border-slate-500 transition-all p-4 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold line-clamp-1">{item.topic}</div>
                        <div className="text-xs text-slate-400 mt-1">{LEVELS.find((l) => l.value === item.level)?.label} • {LENGTHS.find((l) => l.value === item.length)?.label}</div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 group-hover:text-white">
                        <span className="text-xs">Open</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-card p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <XCircle size={16} className="text-brand-success" /> History Manager
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing saved yet.</p>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-auto pr-1 custom-scrollbar">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-brand-border bg-brand-bg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-white font-medium line-clamp-1">{item.topic}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()} • {LEVELS.find((l) => l.value === item.level)?.label}
                        </div>
                      </div>
                      <button
                        onClick={() => removeHistoryItem(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${item.topic}`}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
