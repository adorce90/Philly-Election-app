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
  const rememberedOfficeId =
    typeof window !== "undefined" ? loadSelectedOffice() : null;
  const officeId = queryOfficeId || rememberedOfficeId || "governor";

  const offices = getOffices();
  const office = offices.find((item: any) => item.id === officeId);

  const questions = useMemo(() => getQuestionsByOffice(officeId), [officeId]);

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
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <div>Loading quiz...</div>
      </main>
    );
  }

  if (!question) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <div>No questions found for this office.</div>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 800 }}>
      <p style={{ color: "#666", marginBottom: "0.5rem" }}>
        {questions.length} questions for {office?.name ?? officeId}
      </p>

      <p style={{ color: "#666" }}>
        Question {index + 1} of {questions.length}
      </p>

      <div
        style={{
          marginTop: "0.5rem",
          marginBottom: "1.5rem",
          height: 8,
          width: "100%",
          background: "#e5e5e5",
          borderRadius: 999
        }}
      >
        <div
          style={{
            height: 8,
            width: `${progress}%`,
            background: "#2563eb",
            borderRadius: 999
          }}
        />
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: "1.5rem",
          background: "#fff"
        }}
      >
        <p style={{ color: "#1d4ed8", fontWeight: 600 }}>{question.topic}</p>

        <h1 style={{ fontSize: "1.5rem", marginTop: "0.5rem", lineHeight: 1.4 }}>
          {question.text}
        </h1>

        <div style={{ marginTop: "0.75rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.75rem",
              borderRadius: 999,
              background: "#f3f4f6",
              border: "1px solid #ddd",
              fontSize: "0.8rem"
            }}
          >
            Scope: {question.scope}
          </span>
        </div>

        <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
          {question.options.map((option: string) => {
            const selected = answers[question.id] === optionMap[option];

            return (
              <button
                key={option}
                onClick={() => setAnswer(optionMap[option])}
                style={{
                  padding: "1rem",
                  borderRadius: 12,
                  border: selected ? "2px solid #2563eb" : "1px solid #ccc",
                  background: selected ? "#eff6ff" : "#fff",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          <button
            onClick={previousQuestion}
            disabled={index === 0}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              opacity: index === 0 ? 0.5 : 1,
              cursor: index === 0 ? "not-allowed" : "pointer"
            }}
          >
            Back
          </button>

          <button
            onClick={nextQuestion}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            {index === questions.length - 1 ? "See Results" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>Loading quiz...</main>}>
      <QuizPageInner />
    </Suspense>
  );
}
