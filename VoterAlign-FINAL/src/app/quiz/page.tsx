"use client";

import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getQuestionsByOfficesAndTopics } from "../../lib/loadData";
import { loadMatchedOffices, loadSelectedTopics, loadQuizAnswers, saveQuizAnswers, loadLanguage, saveLanguage } from "../../lib/quizStorage";
import { LANGUAGES, translate } from "../../lib/translations";

type Msg =
  | { from: "bot";      text: string; sub?: string }
  | { from: "bot-q";    qIndex: number }
  | { from: "bot-done" }
  | { from: "user";     text: string };

function QuizInner() {
  const router = useRouter();
  const [lang, setLangState] = useState<string>("en");

  useEffect(() => { setLangState(loadLanguage()); }, []);

  const t = (key: string, vars?: Record<string,string>) => translate(lang, key, vars);

  const matchedOffices = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics = useMemo(() => loadSelectedTopics(), []);
  const questions      = useMemo(() => getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics), [matchedOffices, selectedTopics]);
  const [answers, setAnswers] = useState<Record<string,number>>(loadQuizAnswers);
  const [current, setCurrent] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const OPTIONS = useMemo(() => [
    { value: 1,  emoji: "✓", label: t("quiz_agree")    },
    { value: 0,  emoji: "~", label: t("quiz_notsure")  },
    { value: -1, emoji: "✕", label: t("quiz_disagree") },
  ], [lang]);

  // Init messages
  useEffect(() => {
    if (!lang || !questions.length) return;
    setMessages([
      { from: "bot", text: t("quiz_welcome"), sub: t("quiz_welcome_sub", { n: String(questions.length) }) },
      { from: "bot-q", qIndex: 0 }
    ]);
  }, [lang, questions.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function push(msg: Msg) { setMessages(p => [...p, msg]); }

  const encouragements = useMemo(() => [
    t("quiz_noted"), t("quiz_noted"), t("quiz_noted")
  ], [lang]);

  function handleAnswer(qIndex: number, value: number) {
    const q = questions[qIndex] as any;
    if (answers[q.id] !== undefined) return;
    const opt = OPTIONS.find(o => o.value === value)!;
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    saveQuizAnswers(newAnswers);

    push({ from: "user", text: `${opt.emoji} ${opt.label}` });

    const next = qIndex + 1;
    setTimeout(() => {
      if (next < questions.length) {
        push({ from: "bot", text: `${encouragements[0]} ${t("quiz_next_q", { n: String(next + 1), total: String(questions.length) })}` });
        setTimeout(() => { push({ from: "bot-q", qIndex: next }); setCurrent(next); }, 350);
      } else {
        push({ from: "bot", text: t("quiz_done"), sub: t("quiz_done_sub", { n: String(Object.keys(newAnswers).length), total: String(questions.length) }) });
        setTimeout(() => {
          push({ from: "bot", text: t("quiz_see_matches") });
          setTimeout(() => push({ from: "bot-done" }), 450);
        }, 600);
      }
    }, 350);
  }

  function switchLang(code: string) {
    setLangState(code);
    saveLanguage(code);
    setMessages([]);
    setTimeout(() => {
      setMessages([
        { from: "bot", text: translate(code, "quiz_welcome"), sub: translate(code, "quiz_welcome_sub", { n: String(questions.length) }) },
        { from: "bot-q", qIndex: current }
      ]);
    }, 100);
  }

  const progress = questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  if (!questions.length) return (
    <main className="page-shell"><div className="container" style={{ paddingTop: "2rem", fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>
      No questions found. <a href="/topics" style={{ color: "var(--gold)", borderBottom: "1px solid var(--gold)" }}>← Back to topics</a>
    </div></main>
  );

  return (
    <main className="page-shell">
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

        <div className="bs-masthead">
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-title" style={{ fontSize: "clamp(2rem,6vw,3.2rem)" }}>VoterAlign</div>
          <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Language switcher */}
          <div style={{ display: "flex", gap: ".4rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)" }}>{t("language_label")}:</span>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => switchLang(l.code)} style={{ padding: ".22rem .6rem", border: lang === l.code ? "1.5px solid var(--ink)" : "1px solid var(--rule)", background: lang === l.code ? "var(--parchment-dark)" : "var(--parchment-mid)", fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", fontWeight: lang === l.code ? 700 : 500, color: "var(--ink)", cursor: "pointer" }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Chat card */}
          <div style={{ background: "var(--parchment-mid)", border: "2px solid var(--ink)" }}>

            {/* Header with progress */}
            <div style={{ background: "var(--ink)", padding: ".9rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>⚖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".97rem", color: "#e8d5a0" }}>VoterAlign Guide</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".08em", color: "#a89060" }}>
                  Step 3 of 4 · Question {Math.min(current + 1, questions.length)} of {questions.length}
                </div>
              </div>
              {/* Progress bar in header */}
              <div style={{ minWidth: 80, textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", color: "var(--gold)", marginBottom: ".2rem" }}>{progress}%</div>
                <div style={{ height: 3, background: "rgba(255,255,255,.15)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--gold)", borderRadius: 999, width: `${progress}%`, transition: "width .4s ease" }} />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".9rem", minHeight: 280 }}>
              {messages.map((msg, i) => {
                if (msg.from === "bot") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", animation: "fadeUp .25s ease both" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", padding: ".8rem 1rem", borderRadius: "2px 14px 14px 14px", maxWidth: "85%" }}>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.7 }}>{msg.text}</div>
                      {msg.sub && <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".85rem", color: "var(--ink-mid)", marginTop: ".35rem" }}>{msg.sub}</div>}
                    </div>
                  </div>
                );

                if (msg.from === "bot-q") {
                  const q       = questions[msg.qIndex] as any;
                  if (!q) return null;
                  const answered = answers[q.id] !== undefined;
                  const chosen   = answers[q.id];
                  return (
                    <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", animation: "fadeUp .25s ease both" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                      <div style={{ background: "var(--parchment)", border: "2px solid var(--ink)", padding: "1rem 1.1rem", borderRadius: "2px 14px 14px 14px", flex: 1 }}>
                        {/* Topic + scope */}
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)", marginBottom: ".5rem" }}>
                          {q.topic} · {q.scope === "state" ? t("state_label") : t("federal_label")}
                        </div>
                        {/* Question text — stays in English (it's a legal/civic statement) */}
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1rem,2.2vw,1.3rem)", fontWeight: 600, color: "var(--ink)", lineHeight: 1.5, marginBottom: ".75rem" }}>{q.text}</div>
                        {q.whyItMatters && (
                          <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".9rem", color: "var(--ink-mid)", borderLeft: "2px solid var(--gold)", paddingLeft: ".7rem", lineHeight: 1.65, marginBottom: "1rem" }}>{q.whyItMatters}</div>
                        )}
                        {/* Answer options */}
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                          {OPTIONS.map(opt => {
                            const isChosen = answered && chosen === opt.value;
                            const isOther  = answered && chosen !== opt.value;
                            return (
                              <button
                                key={opt.value}
                                disabled={answered}
                                onClick={() => handleAnswer(msg.qIndex, opt.value)}
                                style={{
                                  display: "flex", alignItems: "center", gap: ".4rem",
                                  padding: ".6rem 1rem",
                                  border: isChosen ? "2px solid var(--ink)" : "1.5px solid var(--rule)",
                                  background: isChosen ? "var(--parchment-dark)" : "var(--parchment-mid)",
                                  opacity: isOther ? .3 : 1,
                                  cursor: answered ? "default" : "pointer",
                                  fontFamily: "'DM Sans',sans-serif",
                                  fontWeight: 600,
                                  fontSize: ".85rem",
                                  color: "var(--ink)",
                                  transition: "border-color .14s, background .14s",
                                }}
                              >
                                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>{opt.emoji}</span>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (msg.from === "bot-done") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                      <button className="btn-bs" onClick={() => router.push("/results")}>{t("quiz_results_btn")}</button>
                      <button className="btn-bs-outline" onClick={() => router.push("/topics")}>{t("quiz_change")}</button>
                    </div>
                  </div>
                );

                if (msg.from === "user") return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "var(--ink)", color: "#e8d5a0", padding: ".65rem .95rem", borderRadius: "14px 2px 14px 14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".88rem", maxWidth: "70%" }}>{msg.text}</div>
                  </div>
                );
                return null;
              })}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<main className="page-shell"><div className="container" style={{ paddingTop: "2rem", fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>Loading your questionnaire...</div></main>}>
      <QuizInner />
    </Suspense>
  );
}
