"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions, getUniqueTopics } from "../../lib/loadData";
import { loadMatchedOffices, saveSelectedTopics } from "../../lib/quizStorage";

const topicIcons: Record<string, string> = {
  "Transit Funding": "🚌",
  "Minimum Wage": "💵",
  "Social Security": "🧓",
  "Voting Rights": "🗳️",
  "Gun Safety": "🛡️",
  "Climate Action": "🌎"
};

export default function TopicsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const matchedOffices = loadMatchedOffices();
  const allQuestions = getQuestions();

  const topics = useMemo(() => {
    const filtered = allQuestions.filter((q: any) =>
      q.relevantOfficeIds?.some((id: string) => matchedOffices.includes(id))
    );

    return Array.from(new Set(filtered.map((q: any) => q.topic)));
  }, [allQuestions, matchedOffices]);

  function toggleTopic(topic: string) {
    setSelected((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      if (prev.length >= 3) return prev;
      return [...prev, topic];
    });
  }

  function continueToQuiz() {
    saveSelectedTopics(selected);
    router.push("/quiz");
  }

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container">
          <div className="panel panel-lg">
            <span className="eyebrow">Step 2</span>
            <h1 className="header-title">What matters most to you?</h1>
            <p className="section-copy">
              Pick up to 3 topics. We’ll personalize your assessment around the
              issues you care about most.
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
              }}
            >
              {topics.map((topic: string) => {
                const active = selected.includes(topic);

                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: "1rem",
                      borderRadius: 16,
                      border: active ? "2px solid #2563eb" : "1px solid #dbe3ef",
                      background: active ? "#eff6ff" : "#fff",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: "1.6rem" }}>{topicIcons[topic] || "📌"}</div>
                    <div style={{ marginTop: "0.5rem", fontWeight: 800, color: "#0f172a" }}>
                      {topic}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="spacer-top">
              <button className="btn" onClick={continueToQuiz}>
                Continue to assessment
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
