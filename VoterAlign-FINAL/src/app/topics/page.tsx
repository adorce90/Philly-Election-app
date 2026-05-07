"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getQuestions } from "../../lib/loadData";
import { loadMatchedOffices, loadLanguage, saveLanguage, saveSelectedTopics } from "../../lib/quizStorage";
import { LANGUAGES, translate, topicName } from "../../lib/translations";

const TOPIC_ICONS: Record<string,string> = {
  "Transit Funding":"🚌","Minimum Wage":"💰","Housing":"🏠","Education":"🎓",
  "Social Security":"👴","Voting Rights":"🗳️","Gun Safety":"🛡️","Climate Action":"🌎"
};
const TOPIC_DESC_EN: Record<string,string> = {
  "Transit Funding":"SEPTA, buses, regional rail",
  "Minimum Wage":"Worker pay & living wages",
  "Housing":"Rent, affordability & development",
  "Education":"Schools, funding & pre-K",
  "Social Security":"Retirement & senior benefits",
  "Voting Rights":"Election access & integrity",
  "Gun Safety":"Firearms policy & public safety",
  "Climate Action":"Environment & clean energy"
};

type Msg =
  | { from: "bot"; text: string; sub?: string }
  | { from: "bot-topics"; topics: string[]; scope: "state" | "federal" }
  | { from: "bot-actions"; actions: { label: string; primary?: boolean; onClick: () => void }[] }
  | { from: "user"; text: string };

export default function TopicsPage() {
  const router = useRouter();
  const [lang, setLangState] = useState<string>("en");
  const questions      = getQuestions();
  const matchedOffices = loadMatchedOffices();

  useEffect(() => { setLangState(loadLanguage()); }, []);

  const t = (key: string, vars?: Record<string,string>) => translate(lang, key, vars);

  const { stateTopics, federalTopics } = useMemo(() => {
    const relevant = questions.filter((q: any) =>
      q.relevantOfficeIds?.some((id: string) => matchedOffices.includes(id))
    );
    const st = new Set<string>(); const ft = new Set<string>();
    relevant.forEach((q: any) => { if (q.scope === "state") st.add(q.topic); if (q.scope === "federal") ft.add(q.topic); });
    return { stateTopics: Array.from(st), federalTopics: Array.from(ft) };
  }, [questions, matchedOffices]);

  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase]       = useState<"state" | "federal" | "done">("state");
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Init messages after lang loads
  useEffect(() => {
    if (!lang) return;
    setMessages([
      { from: "bot", text: t("topics_welcome") },
      { from: "bot", text: t("topics_state") },
      { from: "bot-topics", topics: stateTopics, scope: "state" }
    ]);
  }, [lang]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function push(msg: Msg) { setMessages(p => [...p, msg]); }

  function toggle(topic: string, isState: boolean) {
    const scopeSel = selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t));
    if (selected.includes(topic)) { setSelected(p => p.filter(t => t !== topic)); return; }
    if (scopeSel.length >= 2) return;
    setSelected(p => [...p, topic]);
  }

  function handleStateNext() {
    const chosen = selected.filter(t => stateTopics.includes(t));
    if (!chosen.length) return;
    push({ from: "user", text: chosen.map(t => `${TOPIC_ICONS[t] || "📌"} ${topicName(lang, t)}`).join("  ·  ") });
    setTimeout(() => {
      if (federalTopics.length > 0) {
        push({ from: "bot", text: t("topics_federal") });
        setTimeout(() => { push({ from: "bot-topics", topics: federalTopics, scope: "federal" }); setPhase("federal"); }, 350);
      } else { finishTopics(chosen); }
    }, 380);
  }

  function handleFederalNext() {
    const chosen = selected.filter(t => federalTopics.includes(t));
    if (!chosen.length) return;
    push({ from: "user", text: chosen.map(t => `${TOPIC_ICONS[t] || "📌"} ${topicName(lang, t)}`).join("  ·  ") });
    setTimeout(() => finishTopics(selected), 380);
  }

  function finishTopics(topics: string[]) {
    saveSelectedTopics(topics);
    setPhase("done");
    push({ from: "bot", text: t("topics_confirm", { n: String(topics.length), s: topics.length > 1 ? "s" : "" }), sub: topics.map(t => `${TOPIC_ICONS[t] || "📌"} ${topicName(lang, t)}`).join("  ·  ") });
    setTimeout(() => push({
      from: "bot-actions",
      actions: [
        { label: t("topics_start_btn"), primary: true, onClick: () => router.push("/quiz") },
        { label: t("topics_back"), onClick: () => router.push("/") }
      ]
    }), 500);
  }

  function switchLang(code: string) {
    setLangState(code);
    saveLanguage(code);
    setMessages([]);
    setSelected([]);
    setPhase("state");
    setTimeout(() => {
      setMessages([
        { from: "bot", text: translate(code, "topics_welcome") },
        { from: "bot", text: translate(code, "topics_state") },
        { from: "bot-topics", topics: stateTopics, scope: "state" }
      ]);
    }, 100);
  }

  return (
    <main className="page-shell">
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

        {/* Masthead */}
        <div className="bs-masthead">
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-title" style={{ fontSize: "clamp(2rem,6vw,3.2rem)" }}>VoterAlign</div>
          <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Language switcher */}
          <div style={{ display: "flex", gap: ".4rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)" }}>{t("language_label")}:</span>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => switchLang(l.code)} style={{ padding: ".22rem .6rem", border: lang === l.code ? "1.5px solid var(--ink)" : "1px solid var(--rule)", background: lang === l.code ? "var(--parchment-dark)" : "var(--parchment-mid)", fontFamily: "'DM Sans',sans-serif", fontSize: ".72rem", fontWeight: lang === l.code ? 700 : 500, color: "var(--ink)", cursor: "pointer" }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Chat card */}
          <div style={{ background: "var(--parchment-mid)", border: "2px solid var(--ink)" }}>
            <div style={{ background: "var(--ink)", padding: ".9rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>⚖</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".97rem", color: "#e8d5a0" }}>VoterAlign Guide</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".08em", color: "#a89060" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#4ade80", marginRight: ".3rem", verticalAlign: "middle" }} />
                  Step 2 of 4 · {LANGUAGES.find(l => l.code === lang)?.label}
                </div>
              </div>
            </div>

            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".9rem", minHeight: 280 }}>
              {messages.map((msg, i) => {
                if (msg.from === "bot") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", animation: "fadeUp .25s ease both" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", padding: ".8rem 1rem", borderRadius: "2px 14px 14px 14px", maxWidth: "85%" }}>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.7 }}>{msg.text}</div>
                      {msg.sub && <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".85rem", color: "var(--ink-mid)", marginTop: ".4rem" }}>{msg.sub}</div>}
                    </div>
                  </div>
                );

                if (msg.from === "bot-topics") {
                  const isState  = msg.scope === "state";
                  const isActive = (isState && phase === "state") || (!isState && phase === "federal");
                  const scopeSel = selected.filter(t => isState ? stateTopics.includes(t) : federalTopics.includes(t));
                  return (
                    <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: ".5rem", marginBottom: ".75rem" }}>
                          {msg.topics.map(topic => {
                            const isSel = selected.includes(topic);
                            const isDim = !isSel && scopeSel.length >= 2;
                            return (
                              <button
                                key={topic}
                                disabled={!isActive || isDim}
                                onClick={() => isActive && toggle(topic, isState)}
                                style={{
                                  padding: ".8rem .7rem",
                                  border: isSel ? "2px solid var(--ink)" : "1.5px solid var(--rule)",
                                  background: isSel ? "var(--parchment-dark)" : "var(--parchment-mid)",
                                  cursor: isActive && !isDim ? "pointer" : "default",
                                  opacity: isDim ? .35 : 1,
                                  textAlign: "center",
                                  fontFamily: "'DM Sans',sans-serif",
                                  transition: "border-color .14s, background .14s",
                                }}
                              >
                                <div style={{ fontSize: "1.25rem", marginBottom: ".3rem" }}>{TOPIC_ICONS[topic] || "📌"}</div>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".85rem", fontWeight: 700, color: "var(--ink)" }}>{topicName(lang, topic)}</div>
                                <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".72rem", color: "var(--ink-muted)", marginTop: ".15rem", lineHeight: 1.35 }}>{TOPIC_DESC_EN[topic]}</div>
                              </button>
                            );
                          })}
                        </div>
                        {isActive && (
                          <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              className="btn-bs"
                              onClick={isState ? handleStateNext : handleFederalNext}
                              disabled={scopeSel.length === 0}
                              style={{ opacity: scopeSel.length === 0 ? .35 : 1 }}
                            >
                              {isState && federalTopics.length > 0 ? t("topics_next_fed") : t("topics_done")}
                            </button>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".07em" }}>
                              {t("topics_selected", { n: String(scopeSel.length) })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (msg.from === "bot-actions") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                      {msg.actions.map((a, j) => (
                        <button key={j} className={a.primary ? "btn-bs" : "btn-bs-outline"} onClick={a.onClick}>{a.label}</button>
                      ))}
                    </div>
                  </div>
                );

                if (msg.from === "user") return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "var(--ink)", color: "#e8d5a0", padding: ".7rem .95rem", borderRadius: "14px 2px 14px 14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: ".9rem", maxWidth: "75%" }}>{msg.text}</div>
                  </div>
                );
                return null;
              })}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    </main>
  );
}
