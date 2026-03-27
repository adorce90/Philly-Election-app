"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestionsByOfficesAndTopics } from "../../lib/loadData";
import {
  loadMatchedOffices,
  loadQuizAnswers,
  loadSelectedTopics,
  saveQuizAnswers
} from "../../lib/quizStorage";

const optionMap: Record<string, number> = {
  Support: 1,
  Neutral: 0,
  Oppose: -1
};

function QuizPageInner() {
  const router = useRouter();
  const matchedOffices = loadMatchedOffices();
  const selectedTopics = loadSelectedTopics();

  const questions = useMemo(() => {
    return getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics);
  }, [matchedOffices, selectedTopics]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedAnswers = loadQuizAnswers();
    setAnswers(storedAnswers);

    const firstUnansweredIndex = questions.findIndex(
      (question: any) =>
        storedAnswers[question.id] === null ||
        storedAnswers[question.id] === undefined
    );

    setIndex(firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex);
    setHydrated(true);
  }, [questions]);

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
    router.push("/results");
  }

  function previousQuestion() {
    if (index > 0) setIndex((prev) => prev - 1);
  }

  if (!hydrated) {
    return (
      <main className="page-shell quiz-shell">
        <div className="container">
          <div className="panel panel-lg">Loading assessment...</div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="page-shell quiz-shell">
        <div className="container">
          <div className="panel panel-lg">
            No questions found for your selected ZIP code and topics.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell quiz-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Assessment</span>
          <h1 className="header-title">Your personalized ballot match</h1>
          <p className="section-copy">
            Answer a few questions based on your ZIP code and selected priorities.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="quiz-layout">
          <div className="progress-meta">
            <span>{questions.length} personalized questions</span>
            <span>
              Question {index + 1} of {questions.length}
            </span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="quiz-card">
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
            <div className="panel panel-lg">Loading assessment...</div>
          </div>
        </main>
      }
    >
      <QuizPageInner />
    </Suspense>
  );
}
