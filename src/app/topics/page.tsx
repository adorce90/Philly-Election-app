"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "../../lib/loadData";
import { saveSelectedTopics } from "../../lib/quizStorage";

export default function TopicSelectionPage() {
  const router = useRouter();

  const questions = getQuestions();

  // Extract unique topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q: any) => set.add(q.topic));
    return Array.from(set);
  }, [questions]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      return;
    }

    if (selectedTopics.length >= 3) return;

    setSelectedTopics([...selectedTopics, topic]);
  };

  const handleContinue = () => {
    if (selectedTopics.length === 0) return;

    saveSelectedTopics(selectedTopics);
    router.push("/quiz");
  };

  return (
    <main className="page-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Step 2</span>
          <h1 className="header-title">What matters most to you?</h1>
          <p className="section-copy">
            Select up to 3 topics. We’ll focus your match on what actually matters in your life.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1rem"
            }}
          >
            {topics.map((topic) => {
              const selected = selectedTopics.includes(topic);

              return (
                <div
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  style={{
                    cursor: "pointer",
                    padding: "1.2rem",
                    borderRadius: "14px",
                    border: selected
                      ? "2px solid #2563eb"
                      : "1px solid #dbe3ef",
                    background: selected ? "#eff6ff" : "#fff",
                    textAlign: "center",
                    fontWeight: 600,
                    transition: "all 0.2s ease"
                  }}
                >
                  {topic}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              {selectedTopics.length}/3 selected
            </p>

            {selectedTopics.length === 3 && (
              <p
                style={{
                  marginTop: "0.3rem",
                  fontSize: "0.85rem",
                  color: "#dc2626"
                }}
              >
                You can only select up to 3 topics
              </p>
            )}
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button
              onClick={handleContinue}
              disabled={selectedTopics.length === 0}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                background:
                  selectedTopics.length === 0 ? "#cbd5f5" : "#2563eb",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor:
                  selectedTopics.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              Continue to Questions
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
