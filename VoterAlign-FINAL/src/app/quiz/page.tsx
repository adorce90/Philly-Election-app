"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getQuestionsByOfficesAndTopics } from "../../lib/loadData";
import { loadMatchedOffices, loadSelectedTopics, loadQuizAnswers, saveQuizAnswers } from "../../lib/quizStorage";

const OPTIONS = [
  { value: 1,  label: "Agree",    emoji: "✓" },
  { value: 0,  label: "Not sure", emoji: "~" },
  { value: -1, label: "Disagree", emoji: "✕" },
];

function QuizInner() {
  const router = useRouter();
  const matchedOffices  = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics  = useMemo(() => loadSelectedTopics(), []);
  const questions = useMemo(() => getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics), [matchedOffices, selectedTopics]);
  const [answers, setAnswers] = useState<Record<string,number>>(loadQuizAnswers);
  const [current, setCurrent] = useState(0);

  const q = questions[current] as any;
  const answered = q ? answers[q.id] !== undefined : false;
  const progress = questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  function handleAnswer(value: number) {
    if (!q || answered) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    saveQuizAnswers(next);
    if (current + 1 < questions.length) {
      setTimeout(() => setCurrent(c => c + 1), 280);
    }
  }

  if (!questions.length) return (
    <main className="page-shell"><div className="container bs-section">
      <div style={{ border: "1px solid var(--rule)", padding: "1.5rem", background: "var(--parchment-mid)", fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>
        No questions found for your selected topics. <a href="/topics" style={{ color: "var(--gold)", borderBottom: "1px solid var(--gold)" }}>Go back to topics →</a>
      </div>
    </div></main>
  );

  const isComplete = Object.keys(answers).length >= questions.length;

  return (
    <main className="page-shell">
      <div className="container bs-section">
        <div className="bs-masthead" style={{ paddingTop: "1.5rem", paddingBottom: "1rem" }}>
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-title" style={{ fontSize: "2.5rem" }}>Your Questionnaire</div>
          <div className="bs-subtitle">Answer honestly — there are no wrong answers</div>
        </div>

        {/* Progress */}
        <div className="bs-progress-wrap">
          <div className="bs-progress-meta">
            <span>{isComplete ? "All questions answered" : `Question ${current + 1} of ${questions.length}`}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="bs-progress-track"><div className="bs-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Question card */}
        {!isComplete && q && (
          <div className="bs-quiz-card">
            <div className="bs-quiz-topic">{q.topic} · {q.scope === "state" ? "State" : "Federal"}</div>
            <div className="bs-quiz-q">{q.text}</div>
            {q.whyItMatters && <div className="bs-quiz-why">{q.whyItMatters}</div>}
            <div className="bs-quiz-options">
              {OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  disabled={answered}
                  className={`bs-quiz-option${answered && answers[q.id] === opt.value ? " sel" : ""}${answered && answers[q.id] !== opt.value ? " faded" : ""}`}
                >
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: ".65rem", alignItems: "center", flexWrap: "wrap" }}>
          {current > 0 && !isComplete && (
            <button className="btn-bs-outline" onClick={() => setCurrent(c => c - 1)}>← Previous</button>
          )}
          {isComplete && (
            <>
              <button className="btn-bs" onClick={() => router.push("/results")}>See My Matches →</button>
              <button className="btn-bs-outline" onClick={() => { setCurrent(0); }}>← Review answers</button>
            </>
          )}
        </div>

        {/* Previous questions answered */}
        {current > 0 && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)", marginBottom: ".6rem" }}>
              Previous answers
            </div>
            {questions.slice(0, current).map((pq: any, i: number) => {
              const ans = answers[pq.id];
              const opt = OPTIONS.find(o => o.value === ans);
              return (
                <div key={pq.id} style={{ display: "flex", justifyContent: "space-between", padding: ".3rem 0", borderBottom: "1px dotted var(--rule-soft)", fontFamily: "'EB Garamond',serif", fontSize: ".88rem" }}>
                  <span style={{ color: "var(--ink-soft)" }}>{pq.text}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", fontWeight: 700, color: ans === 1 ? "var(--agree)" : ans === -1 ? "var(--oppose)" : "var(--gold)", marginLeft: ".75rem", flexShrink: 0 }}>
                    {opt?.emoji} {opt?.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<main className="page-shell"><div className="container bs-section" style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>Loading your questionnaire...</div></main>}>
      <QuizInner />
    </Suspense>
  );
}
