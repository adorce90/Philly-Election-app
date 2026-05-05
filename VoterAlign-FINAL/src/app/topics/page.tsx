"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "../../lib/loadData";
import { loadMatchedOffices, saveSelectedTopics } from "../../lib/quizStorage";

const TOPIC_ICONS: Record<string, string> = {
  "Transit Funding": "🚌",
  "Minimum Wage": "💰",
  "Housing": "🏠",
  "Education": "🎓",
  "Social Security": "👴",
  "Voting Rights": "🗳️",
  "Gun Safety": "🛡️",
  "Climate Action": "🌎"
};

const TOPIC_DESC: Record<string, string> = {
  "Transit Funding": "SEPTA, buses, regional rail",
  "Minimum Wage": "Worker pay & living wages",
  "Housing": "Rent, affordability & development",
  "Education": "Schools, funding & pre-K",
  "Social Security": "Retirement & senior benefits",
  "Voting Rights": "Election access & integrity",
  "Gun Safety": "Firearms policy & public safety",
  "Climate Action": "Environment & clean energy"
};

type Msg =
  | { from: "bot"; text: string; sub?: string }
  | { from: "bot-topics"; topics: string[]; scope: "state" | "federal" }
  | { from: "bot-actions"; actions: { label: string; primary?: boolean; onClick: () => void }[] }
  | { from: "user"; text: string };

export default function TopicsPage() {
  const router = useRouter();
  const questions = getQuestions();
  const matchedOffices = loadMatchedOffices();

  const { stateTopics, federalTopics } = useMemo(() => {
    const relevant = questions.filter((q: any) =>
      q.relevantOfficeIds?.some((id: string) => matchedOffices.includes(id))
    );
    const st = new Set<string>();
    const ft = new Set<string>();
    relevant.forEach((q: any) => {
      if (q.scope === "state") st.add(q.topic);
      if (q.scope === "federal") ft.add(q.topic);
    });
    return { stateTopics: Array.from(st), federalTopics: Array.from(ft) };
  }, [questions, matchedOffices]);

  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<"state" | "federal" | "done">("state");

  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Great — now let's personalize your questions. 🎯" },
    { from: "bot", text: "First, pick up to 2 state-level issues. These are things your Governor and State House reps can actually control." },
    { from: "bot-topics", topics: stateTopics, scope: "state" }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function push(msg: Msg) { setMessages(p => [...p, msg]); }

  function toggleTopic(topic: string, scope: "state" | "federal") {
    const max = 2;
    const scopeSelected = selected.filter(t =>
      scope === "state" ? stateTopics.includes(t) : federalTopics.includes(t)
    );
    if (selected.includes(topic)) {
      setSelected(p => p.filter(t => t !== topic));
    } else if (scopeSelected.length < max) {
      setSelected(p => [...p, topic]);
    }
  }

  function handleStateNext() {
    const stateChosen = selected.filter(t => stateTopics.includes(t));
    if (!stateChosen.length) return;

    push({ from: "user", text: stateChosen.map(t => `${TOPIC_ICONS[t] || "📌"} ${t}`).join("  ") });

    setTimeout(() => {
      if (federalTopics.length > 0) {
        push({ from: "bot", text: `Good choices. Now pick up to 2 federal issues — things your U.S. Representatives can influence.` });
        setTimeout(() => {
          push({ from: "bot-topics", topics: federalTopics, scope: "federal" });
          setPhase("federal");
        }, 400);
      } else {
        finishTopics(stateChosen);
      }
    }, 400);
  }

  function handleFederalNext() {
    const fedChosen = selected.filter(t => federalTopics.includes(t));
    if (!fedChosen.length) return;
    push({ from: "user", text: fedChosen.map(t => `${TOPIC_ICONS[t] || "📌"} ${t}`).join("  ") });
    setTimeout(() => finishTopics(selected), 400);
  }

  function finishTopics(topics: string[]) {
    saveSelectedTopics(topics);
    setPhase("done");
    push({ from: "bot", text: `Perfect — ${topics.length} issue${topics.length > 1 ? "s" : ""} selected. Ready for your questions?`, sub: topics.map(t => TOPIC_ICONS[t] + " " + t).join(" · ") });
    setTimeout(() => push({
      from: "bot-actions",
      actions: [
        { label: "Start questions →", primary: true, onClick: () => router.push("/quiz") },
        { label: "← Back", onClick: () => router.push("/") }
      ]
    }), 500);
  }

  return (
    <main className="page-shell" style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className="conv-layout conv-layout-single">
        <div className="conv-chat-card conv-tall">
          <div className="conv-chat-header">
            <div className="conv-chat-avatar">⚖</div>
            <div>
              <div className="conv-chat-name">VoterAlign Guide</div>
              <div className="conv-chat-status"><span className="conv-online-dot" />Step 2 of 4 — Your Issues</div>
            </div>
            <div className="conv-progress-mini">
              <div className="conv-progress-track"><div className="conv-progress-fill" style={{ width: "50%" }} /></div>
            </div>
          </div>

          <div className="conv-messages">
            {messages.map((msg, i) => {
              if (msg.from === "bot") return (
                <div key={i} className="conv-msg-row bot">
                  <div className="conv-msg-avatar">⚖</div>
                  <div className="conv-bubble bot">
                    <div>{msg.text}</div>
                    {msg.sub && <div className="conv-bubble-sub">{msg.sub}</div>}
                  </div>
                </div>
              );

              if (msg.from === "bot-topics") {
                const isState = msg.scope === "state";
                const isActive = (isState && phase === "state") || (!isState && phase === "federal");
                const scopeTopics = msg.topics;
                return (
                  <div key={i} className="conv-msg-row bot" style={{ alignItems: "flex-start" }}>
                    <div className="conv-msg-avatar">⚖</div>
                    <div style={{ flex: 1 }}>
                      <div className="conv-topic-grid">
                        {scopeTopics.map(topic => {
                          const isSel = selected.includes(topic);
                          const scopeSelected = selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t));
                          const isDisabled = !isActive || (!isSel && scopeSelected.length >= 2);
                          return (
                            <button
                              key={topic}
                              onClick={() => isActive && toggleTopic(topic, msg.scope)}
                              disabled={isDisabled}
                              className={`conv-topic-tile${isSel ? " sel" : ""}${isDisabled && !isSel ? " dim" : ""}`}
                            >
                              <div className="conv-topic-emoji">{TOPIC_ICONS[topic] || "📌"}</div>
                              <div className="conv-topic-name">{topic}</div>
                              <div className="conv-topic-desc">{TOPIC_DESC[topic] || ""}</div>
                            </button>
                          );
                        })}
                      </div>
                      {isActive && (
                        <div style={{ marginTop: "0.85rem" }}>
                          <button
                            className="btn"
                            onClick={isState ? handleStateNext : handleFederalNext}
                            disabled={selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t)).length === 0}
                            style={{ opacity: selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t)).length === 0 ? 0.4 : 1 }}
                          >
                            {isState && federalTopics.length > 0 ? "Next: Federal issues →" : "Done — show my questions →"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.from === "bot-actions") return (
                <div key={i} className="conv-msg-row bot">
                  <div className="conv-msg-avatar">⚖</div>
                  <div className="conv-actions-row">
                    {msg.actions.map((a, j) => (
                      <button key={j} className={a.primary ? "btn" : "btn-secondary"} onClick={a.onClick}>{a.label}</button>
                    ))}
                  </div>
                </div>
              );

              return (
                <div key={i} className="conv-msg-row user">
                  <div className="conv-bubble user">{msg.text}</div>
                  <div className="conv-msg-avatar user-av">You</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </main>
  );
}
