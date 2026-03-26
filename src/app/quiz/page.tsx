"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOffices, getQuestionsByOffice } from "../../lib/loadData";
import {
  loadQuizAnswers,
  loadSelectedOffice,
  saveQuizAnswers,
  saveSelectedOffice
} from "../../lib/quizStorage";

const optionMap: Record<string, number> = {
  Support: 1,
  Neutral: 0,
  Oppose: -1
};

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryOfficeId = searchParams.get("office");
  const mode = searchParams.get("mode");
  const rememberedOfficeId =
    typeof window !== "undefined" ? loadSelectedOffice() : null;
  const officeId = queryOfficeId || rememberedOfficeId || "governor";

  const offices = getOffices();
  const office = offices.find((item: any) => item.id === officeId);

  const allQuestions = useMemo(() => getQuestionsByOffice(officeId), [officeId]);
  const questions = mode === "extended" ? allQuestions : allQuestions.slice(0, 5);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedAnswers = loadQuizAnswers();
    setAnswers(storedAnswers);
    saveSelectedOffice(officeId);

    const firstUnansweredIndex = questions.findIndex(
      (question: any) =>
        storedAnswers[question.id] === null ||
        storedAnswers[question.id] === undefined
    );

    setIndex(firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex);
    setHydrated(true);
  }, [officeId, questions]);

  useEffect(() => {
    if (!hydrated) return;
    saveQuizAnswers(answers);
  }, [answers, hydrated]);

  const question = questions[index];
  const progress = questions.length
    ? Math.round(((index + 1) / questions.length) * 100)
    : 0;

  function setAnswer(value: number) {
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: value
    }));
  }

  function nextQuestion() {
    if (!question) return;

    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    saveQuizAnswers(answers);
    saveSelectedOffice(officeId);
    router.push(`/results?office=${officeId}`);
  }

  function previousQuestion() {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  }

  if (!hydrated) {
    return (
      <main className="page-shell quiz-shell">
        <div className="container">
          <div className="panel panel-lg">Loading quiz...</div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="page-shell quiz-shell">
        <div className="container">
          <div className="panel panel-lg">No questions found for this office.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell quiz-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Assessment</span>
          <h1 className="header-title">{office?.name ?? officeId}</h1>
          <p className="section-copy">
            Answer honestly. Your results will rank candidates by issue alignment
            and weight office-relevant questions more heavily.
          </p>

          {mode === "extended" ? (
            <p
              style={{
                marginTop: "0.75rem",
                color: "#1d4ed8",
                fontWeight: 700
              }}
            >
              Extended mode: more questions for a more precise match.
            </p>
          ) : null}
        </div>
      </section>

      <div className="container">
        <div className="quiz-layout">
          <div className="progress-meta">
            <span>{questions.length} questions for {office?.name ?? officeId}</span>
            <span>
              Question {index + 1} of {questions.length}
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="quiz-card">
            <p
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginBottom: "0.5rem"
              }}
            >
              Question {index + 1} of {questions.length}
            </p>

            <div className="topic-label">{question.topic}</div>
            <h2 className="question-title">{question.text}</h2>

            {"description" in question && typeof question.description === "string" ? (
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "#64748b",
                  fontSize: "0.9rem",
                  lineHeight: 1.5
                }}
              >
                {question.description}
              </p>
            ) : null}

            {"whyItMatters" in question && typeof question.whyItMatters === "string" ? (
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "#1d4ed8",
                  fontWeight: 600,
                  fontSize: "0.9rem"
                }}
              >
                Why it matters: {question.whyItMatters}
              </p>
            ) : null}

            <div className="chip-row">
              <span className="chip">Scope: {question.scope}</span>
            </div>

            <div className="option-list">
              {question.options.map((option: string) => {
                const selected = answers[question.id] === optionMap[option];

                return (
                  <button
                    key={option}
                    onClick={() => setAnswer(optionMap[option])}
                    className={`option-button ${selected ? "selected" : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="row-actions">
              <button
                onClick={previousQuestion}
                disabled={index === 0}
                className="btn-secondary"
                style={{ opacity: index === 0 ? 0.5 : 1 }}
              >
                Back
              </button>

              <button onClick={nextQuestion} className="btn">
                {index === questions.length - 1 ? "See Results" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell quiz-shell">
          <div className="container">
            <div className="panel panel-lg">Loading quiz...</div>
          </div>
        </main>
      }
    >
      <QuizPageInner />
    </Suspense>
  );
}
