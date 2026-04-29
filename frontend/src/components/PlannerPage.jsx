import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Sparkles, Loader2, WandSparkles, Copy, RefreshCw, Clock3, ArrowRight, CheckCircle2, ListTodo } from 'lucide-react';
import { triggerToast } from './Toast';
import { useTimer } from '../context/TimerContext';

const STORAGE_KEY = 'ots_ai_study_plans';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const DEFAULT_FORM = {
  examDate: '',
  syllabus: '',
  dailyHours: '4',
  focusBlockMinutes: '50',
};

const loadPlans = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const stripCodeFences = (text) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

const toIsoDate = (date) => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildFallbackPlan = ({ examDate, syllabus, dailyHours, focusBlockMinutes }) => {
  const start = new Date();
  const end = new Date(examDate);
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const syllabusItems = syllabus
    .split(/\n|,|;|•/)
    .map((item) => item.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean);

  const topics = syllabusItems.length > 0 ? syllabusItems : [syllabus.trim() || 'General revision'];
  const studyMinutes = Math.max(60, Number(dailyHours) * 60 || 240);
  const blockMinutes = Math.max(25, Number(focusBlockMinutes) || 50);
  const blockCount = Math.max(2, Math.min(5, Math.round(studyMinutes / blockMinutes)));
  const effectiveBlockMinutes = Math.max(25, Math.floor((studyMinutes - ((blockCount - 1) * 10)) / blockCount));
  const breakMinutes = 10;
  const startHour = 6;
  const startMinute = 0;

  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(start, index);
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const primaryTopic = topics[index % topics.length];
    const secondaryTopic = topics[(index + 1) % topics.length];
    const tertiaryTopic = topics[(index + 2) % topics.length];

    let currentMinutes = startHour * 60 + startMinute;
    const blocks = Array.from({ length: blockCount }, (_, blockIndex) => {
      const subject = blockIndex === 0 ? primaryTopic : blockIndex === 1 ? secondaryTopic : tertiaryTopic;
      const taskByIndex = [
        `Learn and summarize ${subject}`,
        `Solve questions and apply ${subject}`,
        `Revise core formulas and definitions for ${subject}`,
        `Timed practice on ${subject}`,
        `Quick recall and error review for ${subject}`,
      ];
      const startLabel = new Date(date);
      startLabel.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);
      const endLabel = new Date(startLabel.getTime() + effectiveBlockMinutes * 60000);

      const block = {
        start: startLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: endLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject,
        task: taskByIndex[blockIndex] || `Practice ${subject}`,
        durationMinutes: effectiveBlockMinutes,
      };

      currentMinutes += effectiveBlockMinutes + breakMinutes;
      return block;
    });

    return {
      day: index + 1,
      date: dateLabel,
      goal: index === totalDays - 1
        ? `Final revision for ${primaryTopic}`
        : `Build strong control over ${primaryTopic}`,
      blocks,
      focusTimerSubject: blocks[0]?.subject || primaryTopic,
      focusTimerMinutes: effectiveBlockMinutes,
      breakMinutes,
      priority: [primaryTopic, secondaryTopic, tertiaryTopic].filter(Boolean).slice(0, 3),
    };
  });

  return {
    title: 'AI Study Plan',
    examDate: toIsoDate(end),
    totalDays,
    dailyHours: Number(dailyHours) || 4,
    focusBlockMinutes: Number(focusBlockMinutes) || 50,
    summary: `A practical ${totalDays}-day roadmap built from your syllabus. The plan balances learning, practice, and revision while keeping the first focus block ready for the timer.`,
    days,
  };
};

const normalizePlan = (plan, fallbackInput) => {
  if (!plan || typeof plan !== 'object') return buildFallbackPlan(fallbackInput);

  const days = Array.isArray(plan.days)
    ? plan.days
      .filter(Boolean)
      .map((day, index) => ({
        day: Number(day.day) || index + 1,
        date: day.date || '',
        goal: day.goal || `Study day ${index + 1}`,
        blocks: Array.isArray(day.blocks) ? day.blocks.filter(Boolean) : [],
        focusTimerSubject: day.focusTimerSubject || day.blocks?.[0]?.subject || '',
        focusTimerMinutes: Number(day.focusTimerMinutes) || Number(fallbackInput.focusBlockMinutes) || 50,
        breakMinutes: Number(day.breakMinutes) || 10,
        priority: Array.isArray(day.priority) ? day.priority.filter(Boolean).slice(0, 3) : [],
      }))
    : [];

  if (days.length === 0) return buildFallbackPlan(fallbackInput);

  return {
    title: plan.title || 'AI Study Plan',
    examDate: plan.examDate || fallbackInput.examDate,
    totalDays: Number(plan.totalDays) || days.length,
    dailyHours: Number(plan.dailyHours) || Number(fallbackInput.dailyHours) || 4,
    focusBlockMinutes: Number(plan.focusBlockMinutes) || Number(fallbackInput.focusBlockMinutes) || 50,
    summary: plan.summary || `A personalized study plan for ${fallbackInput.examDate}.`,
    days,
  };
};

const parsePlan = (content) => {
  const cleaned = stripCodeFences(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
};

const buildPrompt = ({ examDate, syllabus, dailyHours, focusBlockMinutes }) => `Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "examDate": string,
  "totalDays": number,
  "dailyHours": number,
  "focusBlockMinutes": number,
  "summary": string,
  "days": [
    {
      "day": number,
      "date": string,
      "goal": string,
      "blocks": [
        { "start": string, "end": string, "subject": string, "task": string, "durationMinutes": number }
      ],
      "focusTimerSubject": string,
      "focusTimerMinutes": number,
      "breakMinutes": number,
      "priority": [string, string, string]
    }
  ]
}

Student exam date: ${examDate}
Syllabus:
${syllabus}

Constraints:
- Build a personalized day-by-day roadmap from today until the exam date.
- Use realistic time blocks that fit around ${dailyHours} study hours per day.
- Make the plan exam-first and syllabus-driven.
- Each day should include 2 to 5 study blocks with time ranges.
- Each day must have a clear goal and 3 high-priority topics.
- The first block's subject should be ideal to sync with a focus timer.
- Keep the schedule practical and student-friendly.
- If the syllabus is broad, spread it across revision, practice, and mock-test days.`;

const getDateLabel = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

export default function PlannerPage() {
  const { syncStudyBlock } = useTimer();
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState(loadPlans);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.slice(0, 10)));
  }, [plans]);

  const recentPlans = useMemo(() => plans.slice(0, 4), [plans]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncTimerSubject = (block) => {
    if (!block?.subject) return;
    syncStudyBlock({ ...block, source: 'planner' });
    triggerToast(`Focus timer synced to ${block.subject}`, 'info');
  };

  const openPomodoroWithBlock = (block) => {
    if (!block?.subject) return;
    syncTimerSubject(block);
    navigate('/pomodoro');
  };

  const generatePlan = async (planOverride = null) => {
    const payload = planOverride || form;
    const examDate = payload.examDate?.trim();
    const syllabus = payload.syllabus?.trim();

    if (!examDate) {
      triggerToast('Please add your exam date', 'error');
      return;
    }
    if (!syllabus) {
      triggerToast('Please paste your syllabus', 'error');
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
          max_tokens: 2200,
          messages: [
            {
              role: 'system',
              content: 'You create educational study plans as JSON only. Do not include markdown fences or explanations outside JSON.'
            },
            {
              role: 'user',
              content: buildPrompt(payload)
            }
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to generate study plan');
      }

      const content = data?.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('AI returned an empty response');
      }

      const parsed = parsePlan(content);
      const generated = normalizePlan(parsed, {
        examDate,
        syllabus,
        dailyHours: payload.dailyHours,
        focusBlockMinutes: payload.focusBlockMinutes,
      });

      const nextPlan = {
        id: Date.now().toString(),
        examDate,
        syllabus,
        dailyHours: Number(payload.dailyHours) || 4,
        focusBlockMinutes: Number(payload.focusBlockMinutes) || 50,
        ...generated,
        createdAt: Date.now(),
      };

      setPlan(nextPlan);
      setPlans((prev) => [nextPlan, ...prev.filter((item) => item.examDate !== examDate)]);

      const firstBlock = nextPlan.days?.[0]?.blocks?.[0];
      if (firstBlock) {
        syncTimerSubject(firstBlock);
      } else if (nextPlan.days?.[0]?.focusTimerSubject) {
        syncTimerSubject({ subject: nextPlan.days[0].focusTimerSubject, task: nextPlan.days[0].goal });
      }

      triggerToast(parsed ? 'Study plan generated' : 'Study plan generated with fallback formatting', 'success');
    } catch (error) {
      triggerToast(error.message || 'Could not generate study plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = async () => {
    if (!plan) return;

    const text = [
      `Title: ${plan.title || 'AI Study Plan'}`,
      `Exam Date: ${plan.examDate}`,
      `Total Days: ${plan.totalDays}`,
      `Daily Study Hours: ${plan.dailyHours}`,
      '',
      plan.summary || '',
      '',
      ...(plan.days || []).map((day) => [
        `Day ${day.day} - ${day.date}`,
        `Goal: ${day.goal}`,
        `Focus Timer: ${day.focusTimerSubject} (${day.focusTimerMinutes} mins)`,
        'Blocks:',
        ...(day.blocks || []).map((block) => `- ${block.start}-${block.end} | ${block.subject} | ${block.task} (${block.durationMinutes}m)`),
        `Priority: ${(day.priority || []).join(', ')}`,
        '',
      ].join('\n')),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      triggerToast('Plan copied to clipboard', 'success');
    } catch {
      triggerToast('Clipboard permission denied', 'error');
    }
  };

  const loadRecentPlan = (item) => {
    setPlan(item);
    setForm({
      examDate: item.examDate,
      syllabus: item.syllabus,
      dailyHours: String(item.dailyHours || 4),
      focusBlockMinutes: String(item.focusBlockMinutes || 50),
    });
    const firstBlock = item.days?.[0]?.blocks?.[0];
    if (firstBlock) {
      syncTimerSubject(firstBlock);
    } else if (item.days?.[0]?.focusTimerSubject) {
      syncTimerSubject({ subject: item.days[0].focusTimerSubject, task: item.days[0].goal });
    }
    triggerToast(`Loaded plan for ${getDateLabel(item.examDate)}`, 'info');
  };

  const clearPlan = () => {
    setPlan(null);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="page-enter max-w-7xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-border bg-brand-card/90 backdrop-blur-sm mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_32%)]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs mb-4">
                <WandSparkles size={14} className="text-brand-accent" /> AI Study Plan Generator
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                Build a day-by-day exam roadmap from your syllabus.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Add your exam date and syllabus, and AI will create a personalized study roadmap with time blocks. The first focus block syncs automatically with the shared focus timer.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-white font-black text-xl">{plans.length}</div>
                <div className="text-xs text-slate-400 mt-1">Saved</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-brand-accent font-black text-xl">{form.dailyHours}h</div>
                <div className="text-xs text-slate-400 mt-1">Per day</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center min-w-[92px]">
                <div className="text-brand-success font-black text-xl">{form.focusBlockMinutes}m</div>
                <div className="text-xs text-slate-400 mt-1">Focus block</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-[1fr,0.7fr,0.7fr,auto]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Exam Date</label>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) => updateForm('examDate', e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white focus:outline-none focus:border-brand-accent transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Daily Study Hours</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={form.dailyHours}
                  onChange={(e) => updateForm('dailyHours', e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white focus:outline-none focus:border-brand-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Focus Block</label>
              <input
                type="number"
                min="15"
                max="180"
                step="5"
                value={form.focusBlockMinutes}
                onChange={(e) => updateForm('focusBlockMinutes', e.target.value)}
                className="w-full bg-brand-bg border border-brand-border px-4 py-3.5 rounded-2xl text-white focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>

            <button
              onClick={() => generatePlan()}
              disabled={loading || !form.examDate || !form.syllabus.trim()}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Generating' : 'Generate Plan'}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-slate-400 mb-2 block">Syllabus</label>
            <textarea
              value={form.syllabus}
              onChange={(e) => updateForm('syllabus', e.target.value)}
              placeholder="Paste your syllabus, chapters, units, subjects, and any weak areas you want to prioritize..."
              rows={6}
              className="w-full bg-brand-bg border border-brand-border px-4 py-3 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-all resize-none custom-scrollbar"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr,0.6fr] gap-6 items-start">
        <div className="space-y-6">
          {plan ? (
            <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-brand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-brand-accent text-xs uppercase tracking-[0.2em] mb-2">
                    <CalendarDays size={14} /> Study Roadmap
                  </div>
                  <h2 className="text-2xl font-black text-white">{plan.title || 'Personalized Study Plan'}</h2>
                  <p className="text-sm text-slate-400 mt-1">Exam: {getDateLabel(plan.examDate)} • {plan.totalDays} days planned</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyPlan}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    onClick={() => generatePlan(form)}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={clearPlan}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                      <Sparkles size={16} className="text-brand-accent" /> Summary
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{plan.summary}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                      <Clock3 size={16} className="text-brand-success" /> Timer Sync
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      The shared focus timer is already synced to the next block subject. You can switch it from any day card below.
                    </p>
                    <button
                      onClick={() => syncTimerSubject(plan.days?.[0]?.focusTimerSubject || plan.days?.[0]?.blocks?.[0]?.subject)}
                      className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2.5 rounded-xl font-semibold transition-all"
                    >
                      Sync First Block
                    </button>
                  </div>
                  <div className="rounded-2xl border border-brand-border bg-brand-bg p-5">
                    <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                      <ListTodo size={16} className="text-brand-accent" /> Plan Stats
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between"><span>Days</span><span className="text-white font-semibold">{plan.totalDays}</span></div>
                      <div className="flex justify-between"><span>Daily hours</span><span className="text-white font-semibold">{plan.dailyHours}h</span></div>
                      <div className="flex justify-between"><span>Focus block</span><span className="text-white font-semibold">{plan.focusBlockMinutes}m</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(plan.days || []).map((day) => {
                    const activeSubject = day.focusTimerSubject || day.blocks?.[0]?.subject;
                    return (
                      <div key={`${day.day}-${day.date}`} className="rounded-3xl border border-brand-border bg-brand-bg p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Day {day.day}</div>
                            <h3 className="text-xl font-bold text-white">{day.goal}</h3>
                            <p className="text-sm text-slate-400 mt-1">{day.date}</p>
                          </div>
                          <button
                            onClick={() => syncTimerSubject({ subject: activeSubject, task: day.goal, durationMinutes: day.focusTimerMinutes })}
                            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all"
                          >
                            Sync Timer <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={() => openPomodoroWithBlock({ subject: activeSubject, task: day.goal, durationMinutes: day.focusTimerMinutes })}
                            className="inline-flex items-center gap-2 bg-brand-accent/15 hover:bg-brand-accent/25 text-brand-accent px-4 py-2 rounded-xl font-medium transition-all"
                          >
                            Open in Pomodoro
                          </button>
                        </div>

                        <div className="grid md:grid-cols-[1.35fr,0.65fr] gap-4">
                          <div className="space-y-3">
                            {(day.blocks || []).map((block, index) => (
                              <div key={`${day.day}-${index}-${block.start}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-brand-border bg-brand-card p-4">
                                <div>
                                  <div className="flex items-center gap-2 text-white font-semibold">
                                    <CheckCircle2 size={15} className="text-brand-success" /> {block.subject}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">{block.start} - {block.end} • {block.durationMinutes} mins</div>
                                  <p className="text-sm text-slate-300 mt-2">{block.task}</p>
                                </div>
                                <button
                                  onClick={() => syncTimerSubject(block)}
                                  className="shrink-0 bg-brand-accent/15 hover:bg-brand-accent/25 text-brand-accent px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                                >
                                  Use Timer
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-2xl border border-brand-border bg-brand-card p-4">
                              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Focus Timer</div>
                              <div className="text-lg font-black text-white">{activeSubject || 'Study'}</div>
                              <div className="text-sm text-slate-400 mt-1">{day.focusTimerMinutes || plan.focusBlockMinutes} minute focus block</div>
                            </div>
                            <div className="rounded-2xl border border-brand-border bg-brand-card p-4">
                              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Priority Topics</div>
                              <ul className="space-y-2">
                                {(day.priority || []).map((item, index) => (
                                  <li key={`${item}-${index}`} className="flex gap-2 text-sm text-slate-300">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-accent shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-2xl border border-brand-border bg-brand-card p-4">
                              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Break</div>
                              <div className="text-sm text-slate-300">Take {day.breakMinutes || 10} minutes between blocks to reset focus.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-border bg-brand-card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-brand-border flex items-center justify-center">
                <CalendarDays size={28} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No study plan generated yet</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Add your exam date and syllabus, and AI will create a personalized day-by-day roadmap with time blocks.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-brand-border bg-brand-card p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Clock3 size={16} className="text-brand-accent" /> Recent Plans
            </div>
            {recentPlans.length === 0 ? (
              <p className="text-sm text-slate-400">Your generated roadmaps will appear here.</p>
            ) : (
              <div className="space-y-2">
                {recentPlans.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadRecentPlan(item)}
                    className="w-full text-left rounded-2xl border border-brand-border bg-brand-bg/70 hover:border-slate-500 transition-all p-4 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-white font-semibold line-clamp-1">{item.title || 'AI Study Plan'}</div>
                        <div className="text-xs text-slate-400 mt-1">{getDateLabel(item.examDate)} • {item.totalDays} days</div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 group-hover:text-white">
                        <span className="text-xs">Open</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-card p-5">
            <div className="flex items-center gap-2 mb-4 text-white font-bold">
              <Sparkles size={16} className="text-brand-success" /> How it works
            </div>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>1. Enter the exam date and paste the syllabus.</p>
              <p>2. AI creates a day-by-day roadmap with time blocks and priorities.</p>
              <p>3. Click any block to sync its subject into the shared focus timer.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}