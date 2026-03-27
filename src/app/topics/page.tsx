"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSelectedTopics } from "../../lib/quizStorage";

export default function TopicSelectionPage() {
  const router = useRouter();

  const stateTopics = [
    { name: "Transit Funding", icon: "🚌" },
    { name: "Minimum Wage", icon: "💰" },
    { name: "Housing", icon: "🏠" },
    { name: "Education", icon: "🎓" }
  ];

  const federalTopics = [
    { name: "Social Security", icon: "👴" },
    { name: "Voting Rights", icon: "🗳️" },
    { name: "Gun Safety", icon: "🛑" },
    { name: "Climate Action", icon: "🌎" }
  ];

  const [selectedState, setSelectedState] = useState<string[]>([]);
  const [selectedFederal, setSelectedFederal] = useState<string[]>([]);

  const toggle = (
    topic: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    if (selected.includes(topic)) {
      setSelected(selected.filter((t) => t !== topic));
      return;
    }

    if (selected.length >= 2) return;

    setSelected([...selected, topic]);
  };

  const handleContinue = () => {
    const allTopics = [...selectedState, ...selectedFederal];

    if (allTopics.length === 0) return;

    saveSelectedTopics(allTopics);
    router.push("/quiz");
  };

  const renderGroup = (
    title: string,
    topics: any[],
    selected: string[],
    setSelected: any
  ) => (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem"
        }}
      >
        {topics.map((topic) => {
          const isSelected = selected.includes(topic.name);

          return (
            <div
              key={topic.name}
              onClick={() => toggle(topic.name, selected, setSelected)}
              style={{
                cursor: "pointer",
                padding: "1rem",
                borderRadius: "12px",
                border: isSelected
                  ? "2px solid #2563eb"
                  : "1px solid #dbe3ef",
                background: isSelected ? "#eff6ff" : "#fff",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.6rem" }}>{topic.icon}</div>
              <div style={{ marginTop: "0.5rem", fontWeight: 600 }}>
                {topic.name}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: "0.5rem", color: "#64748b" }}>
        {selected.length}/2 selected
      </p>
    </div>
  );

  return (
    <main className="page-shell">
      <div className="container">
        <h1 style={{ marginBottom: "1rem" }}>
          What matters most to you?
        </h1>

        {renderGroup(
          "🏛 State Issues",
          stateTopics,
          selectedState,
          setSelectedState
        )}

        {renderGroup(
          "🇺🇸 Federal Issues",
          federalTopics,
          selectedFederal,
          setSelectedFederal
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={handleContinue}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              border: "none"
            }}
          >
            Continue to Questions
          </button>
        </div>
      </div>
    </main>
  );
}
