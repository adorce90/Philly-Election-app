"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "../../lib/loadData";
import { loadMatchedOffices, saveSelectedTopics } from "../../lib/quizStorage";

const TOPIC_ICONS: Record<string,string> = { "Transit Funding":"🚌","Minimum Wage":"💰","Housing":"🏠","Education":"🎓","Social Security":"👴","Voting Rights":"🗳️","Gun Safety":"🛡️","Climate Action":"🌎" };
const TOPIC_DESC: Record<string,string> = { "Transit Funding":"SEPTA, buses, regional rail","Minimum Wage":"Worker pay & living wages","Housing":"Rent, affordability & development","Education":"Schools, funding & pre-K","Social Security":"Retirement & senior benefits","Voting Rights":"Election access & integrity","Gun Safety":"Firearms policy & public safety","Climate Action":"Environment & clean energy" };

export default function TopicsPage() {
  const router = useRouter();
  const questions = getQuestions();
  const matchedOffices = loadMatchedOffices();

  const { stateTopics, federalTopics } = useMemo(() => {
    const relevant = questions.filter((q: any) => q.relevantOfficeIds?.some((id: string) => matchedOffices.includes(id)));
    const st = new Set<string>(); const ft = new Set<string>();
    relevant.forEach((q: any) => { if (q.scope === "state") st.add(q.topic); if (q.scope === "federal") ft.add(q.topic); });
    return { stateTopics: Array.from(st), federalTopics: Array.from(ft) };
  }, [questions, matchedOffices]);

  const [selected, setSelected] = useState<string[]>([]);

  function toggle(topic: string, isState: boolean) {
    const max = 2;
    const scopeSel = selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t));
    if (selected.includes(topic)) { setSelected(p => p.filter(t => t !== topic)); return; }
    if (scopeSel.length >= max) return;
    setSelected(p => [...p, topic]);
  }

  function handleContinue() {
    if (!selected.length) return;
    saveSelectedTopics(selected);
    router.push("/quiz");
  }

  function renderGroup(title: string, topics: string[], isState: boolean) {
    if (!topics.length) return null;
    const scopeSel = selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t));
    return (
      <div style={{ marginBottom: "2rem" }}>
        <div className="bs-topic-section-head">
          <div className="bs-topic-section-title">{title}</div>
          <div className="bs-topic-rule" />
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gold)", whiteSpace: "nowrap" }}>
            {scopeSel.length}/2 selected
          </div>
        </div>
        <div className="bs-topic-grid">
          {topics.map(topic => {
            const isSel = selected.includes(topic);
            const isDim = !isSel && scopeSel.length >= 2;
            return (
              <div key={topic} className={`bs-topic-tile${isSel ? " sel" : ""}${isDim ? " dim" : ""}`} onClick={() => !isDim && toggle(topic, isState)}>
                <div className="bs-topic-emoji">{TOPIC_ICONS[topic] || "📌"}</div>
                <div className="bs-topic-name">{topic}</div>
                <div className="bs-topic-desc">{TOPIC_DESC[topic] || ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="container bs-section">
        <div className="bs-masthead" style={{ paddingTop: "1.5rem", paddingBottom: "1rem" }}>
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-title" style={{ fontSize: "2.5rem" }}>Choose Your Issues</div>
          <div className="bs-subtitle">Select up to 2 state issues and up to 2 federal issues that matter most to you</div>
        </div>

        <div style={{ background: "var(--parchment-mid)", border: "1px solid var(--rule)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          {renderGroup("🏛 State Issues", stateTopics, true)}
          {renderGroup("🇺🇸 Federal Issues", federalTopics, false)}
          <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1rem", display: "flex", gap: ".75rem", alignItems: "center" }}>
            <button className="btn-bs" onClick={handleContinue} disabled={!selected.length}>
              Continue to Questions →
            </button>
            <button className="btn-bs-outline" onClick={() => router.push("/")}>← Back</button>
          </div>
        </div>
      </div>
    </main>
  );
}
