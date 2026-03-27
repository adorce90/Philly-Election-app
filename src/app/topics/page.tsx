"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "../../lib/loadData";
import { loadMatchedOffices, saveSelectedTopics } from "../../lib/quizStorage";

export default function TopicSelectionPage() {
  const router = useRouter();
  const questions = getQuestions();
  const matchedOffices = loadMatchedOffices();

  const topicIcons: Record<string, string> = {
    "Transit Funding": "🚌",
    "Minimum Wage": "💰",
    "Housing": "🏠",
    "Education": "🎓",
    "Social Security": "👴",
    "Voting Rights": "🗳️",
    "Gun Safety": "🛑",
    "Climate Action": "🌎"
  };

  const { stateTopics, federalTopics } = useMemo(() => {
    const relevantQuestions = questions.filter((q: any) =>
      q.relevantOfficeIds?.some((id: string) => matchedOffices.includes(id))
    );

    const stateSet = new Set<string>();
    const federalSet = new Set<string>();

    relevantQuestions.forEach((q: any) => {
      if (q.scope === "state") stateSet.add(q.topic);
      if (q.scope === "federal") federalSet.add(q.topic);
    });

    return {
      stateTopics: Array.from(stateSet),
      federalTopics: Array.from(federalSet)
    };
  }, [questions, matchedOffices]);

  const [selectedState, setSelectedState] = useState<string[]>([]);
  const [selectedFederal, setSelectedFederal] = useState<string[]>([]);

  function toggleTopic(
    topic: string,
    selected: string[],
    setSelected: (topics: string[]) => void,
    max: number
  ) {
    if (selected.includes(topic)) {
      setSelected(selected.filter((t) => t !== topic));
      return;
    }

    if (selected.length >= max) return;

    setSelected([...selected, topic]);
  }

  function handleContinue() {
    const allTopics = [...selectedState, ...selectedFederal];
    if (allTopics.length === 0) return;

    saveSelectedTopics(allTopics);
    router.push("/quiz");
  }

  function renderGroup(
    title: string,
    topics: string[],
    selected: string[],
    setSelected: (topics: string[]) => void,
    max: number
  ) {
    if (topics.length === 0) return null;

    return (
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            marginBottom: "1rem",
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#0f172a"
          }}
        >
          {title}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem"
          }}
        >
          {topics.map((topic) => {
            const isSelected = selected.includes(topic);

            return (
              <div
                key={topic}
                onClick={() => toggleTopic(topic, selected, setSelected, max)}
                style={{
                  cursor: "pointer",
                  padding: "1.2rem",
                  borderRadius: "14px",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #dbe3ef",
                  background: isSelected ? "#eff6ff" : "#fff",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>
                  {topicIcons[topic] || "📌"}
                </div>

                <div
                  style={{
                    marginTop: "0.5rem",
                    fontWeight: 600,
                    color: "#0f172a"
                  }}
                >
                  {topic}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: "0.6rem", color: "#64748b", fontSize: "0.9rem" }}>
          {selected.length}/{max} selected
        </p>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Step 2</span>
          <h1 className="header-title">What matters most to you?</h1>
          <p className="section-copy">
            Pick up to 2 state issues and up to 2 federal issues. We’ll match you
            based on the offices on your ballot and the priorities you care about most.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {renderGroup("🏛 State Issues", stateTopics, selectedState, setSelectedState, 2)}
          {renderGroup(
            "🇺🇸 Federal Issues",
            federalTopics,
            selectedFederal,
            setSelectedFederal,
            2
          )}

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={handleContinue}
              disabled={selectedState.length + selectedFederal.length === 0}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                background:
                  selectedState.length + selectedFederal.length === 0
                    ? "#cbd5e1"
                    : "#2563eb",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor:
                  selectedState.length + selectedFederal.length === 0
                    ? "not-allowed"
                    : "pointer"
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
