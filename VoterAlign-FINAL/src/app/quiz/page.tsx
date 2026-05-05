"use client";

import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getQuestionsByOfficesAndTopics } from "../../lib/loadData";
import { loadMatchedOffices, loadSelectedTopics, loadQuizAnswers, saveQuizAnswers } from "../../lib/quizStorage";

const OPTIONS = [
  { value: 1,  label: "Agree",         emoji: "✅" },
  { value: 0,  label: "Not sure",      emoji: "🤔" },
  { value: -1, label: "Disagree",      emoji: "❌" }
];

type Msg =
  | { from: "bot"; text: string; sub?: string }
  | { from: "bot-question"; qIndex: number }
  | { from: "bot-actions"; actions: { label: string; primary?: boolean; onClick: () => void }[] }
  | { from: "user"; text: string };

function QuizInner() {
  const router = useRouter();
  const matchedOffices = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics = useMemo(() => loadSelectedTopics(), []);
  const questions = useMemo(() => getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics), [matchedOffices, selectedTopics]);
  const [answers, setAnswers] = useState<Record<string, number>>(loadQuizAnswers);
  const [currentQ, setCurrentQ] = useState(0);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Msg[]>(() => [
    { from: "bot", text: "Let's do this! I'll ask you one question at a time. 🗳️", sub: `${questions.length} questions total — takes about 2 minutes.` },
    { from: "bot-question", qIndex: 0 }
  ]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function push(msg: Msg) { setMessages(p => [...p, msg]); }

  function handleAnswer(qIndex: number, value: number) {
    const q = questions[qIndex] as any;
    if (answers[q.id] !== undefined) return;

    const option = OPTIONS.find(o => o.value === value)!;
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    saveQuizAnswers(newAnswers);

    push({ from: "user", text: `${option.emoji} ${option.label}` });

    const next = qIndex + 1;
    setTimeout(() => {
      if (next < questions.length) {
        const encouragements = [
          "Got it.", "Noted.", "Good to know.", "Makes sense.", "Recorded."
        ];
        const enc = encouragements[Math.floor(Math.random() * encouragements.length)];
        push({ from: "bot", text: `${enc} Question ${next + 1} of ${questions.length}:` });
        setTimeout(() => {
          push({ from: "bot-question", qIndex: next });
          setCurrentQ(next);
        }, 300);
      } else {
        setDone(true);
        push({ from: "bot", text: "That's all your questions! 🎉", sub: `You answered ${Object.keys(newAnswers).length} out of ${questions.length}.` });
        setTimeout(() => {
          push({ from: "bot", text: "Ready to see which candidates align with your views?" });
          setTimeout(() => push({
            from: "bot-actions",
            actions: [
              { label: "See my matches →", primary: true, onClick: () => router.push("/results") },
              { label: "← Change topics", onClick: () => router.push("/topics") }
            ]
          }), 400);
        }, 600);
      }
    }, 350);
  }

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <main className="page-shell" style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className="conv-layout conv-layout-single">
        <div className="conv-chat-card conv-tall">
          <div className="conv-chat-header">
            <div className="conv-chat-avatar">⚖</div>
            <div style={{ flex: 1 }}>
              <div className="conv-chat-name">VoterAlign Guide</div>
              <div className="conv-chat-status">
                <span className="conv-online-dot" />
                {done ? "All done!" : `Question ${Math.min(currentQ + 1, questions.length)} of ${questions.length}`}
              </div>
            </div>
            <div className="conv-progress-mini">
              <div style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700, marginBottom: "0.25rem", textAlign: "right" }}>{progress}%</div>
              <div className="conv-progress-track"><div className="conv-progress-fill" style={{ width: `${progress}%` }} /></div>
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

              if (msg.from === "bot-question") {
                const q = questions[msg.qIndex] as any;
                if (!q) return null;
                const answered = answers[q.id] !== undefined;
                const chosenValue = answers[q.id];
                return (
                  <div key={i} className="conv-msg-row bot" style={{ alignItems: "flex-start" }}>
                    <div className="conv-msg-avatar">⚖</div>
                    <div className="conv-q-card">
                      <div className="conv-q-topic">{q.topic}</div>
                      <div className="conv-q-text">{q.text}</div>
                      {q.whyItMatters && (
                        <div className="conv-q-why">💡 {q.whyItMatters}</div>
                      )}
                      <div className="conv-q-options">
                        {OPTIONS.map(opt => {
                          const isChosen = answered && chosenValue === opt.value;
                          const isOther = answered && chosenValue !== opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => !answered && handleAnswer(msg.qIndex, opt.value)}
                              disabled={answered}
                              className={`conv-q-option${isChosen ? " chosen" : ""}${isOther ? " faded" : ""}`}
                            >
                              <span className="conv-q-option-emoji">{opt.emoji}</span>
                              <span className="conv-q-option-label">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
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

export default function QuizPage() {
  return (
    <Suspense fallback={<main className="page-shell"><div className="container" style={{ padding: "3rem 0" }}><div className="panel panel-lg">Loading your questions...</div></div></main>}>
      <QuizInner />
    </Suspense>
  );
}
