"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCandidatesByOffice,
  getOffices,
  getQuestionsByOffice
} from "../../lib/loadData";
import { loadQuizAnswers } from "../../lib/quizStorage";
import { rankCandidates } from "../../lib/match";

function ResultsPageInner() {
  const searchParams = useSearchParams();
  const officeId = searchParams.get("office") || "governor";

  const answers = useMemo(() => loadQuizAnswers(), []);
  const questions = getQuestionsByOffice(officeId);
  const candidates = getCandidatesByOffice(officeId);
  const offices = getOffices();
  const office = offices.find((item: any) => item.id === officeId);

  const results = rankCandidates(candidates, questions, answers);

  const questionMap = useMemo(() => {
    return Object.fromEntries(questions.map((q: any) => [q.id, q]));
  }, [questions]);

  return (
    <main className="page-shell results-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Results</span>

          <h1 className="header-title">Your Best Match</h1>

          <p className="section-copy">
            Based on your answers, here are the candidates who align most with your
            views for {office?.name ?? officeId}.
          </p>

          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#64748b" }}>
            Rankings prioritize issues relevant to this office and are based on
            public positions and statements.
          </p>

          <div className="chip-row">
            <Link href={`/quiz?office=${officeId}`}>
              <span className="btn-secondary">Retake quiz</span>
            </Link>
            <Link href="/">
              <span className="btn-secondary">Change office</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {results.length === 0 ? (
            <div className="panel panel-lg">No candidates found for this office.</div>
          ) : (
            <div className="results-list">
              {results.map((result: any, idx: number) => {
                const candidate = candidates.find((c: any) => c.id === result.candidateId);
                if (!candidate) return null;

                const agreementTopics = result.agreements
                  .map((id: string) => questionMap[id]?.topic)
                  .filter(Boolean)
                  .slice(0, 3);

                const differenceTopics = result.differences
                  .map((id: string) => questionMap[id]?.topic)
                  .filter(Boolean)
                  .slice(0, 3);

                const candidateInitials = candidate.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2);

                const borderColor =
                  candidate.partyColor === "blue"
                    ? "#2563eb"
                    : candidate.partyColor === "red"
                    ? "#dc2626"
                    : "#dbe3ef";

                const badgeColor =
                  candidate.partyColor === "blue"
                    ? "#2563eb"
                    : candidate.partyColor === "red"
                    ? "#dc2626"
                    : "#64748b";

                return (
                  <div
                    key={candidate.id}
                    className="result-card"
                    style={{
                      border:
                        idx === 0
                          ? `2px solid ${borderColor}`
                          : `1.5px solid ${borderColor}`,
                      borderRadius: "16px",
                      boxShadow:
                        idx === 0
                          ? "0 14px 36px rgba(15, 23, 42, 0.12)"
                          : undefined
                    }}
                  >
                    {idx === 0 ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.35rem 0.75rem",
                          borderRadius: 999,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          marginBottom: "1rem"
                        }}
                      >
                        Top Match
                      </div>
                    ) : null}

                    <div className="result-top">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: "50%",
                              background: "#e5e7eb",
                              border: `1px solid ${borderColor}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "1.1rem",
                              color: "#374151",
                              flexShrink: 0
                            }}
                          >
                            {candidateInitials}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="rank-badge">#{idx + 1} Match</div>
                            <h2 className="result-name">{candidate.name}</h2>

                            <div
                              style={{
                                marginTop: "0.45rem",
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                                flexWrap: "wrap"
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "0.28rem 0.65rem",
                                  borderRadius: 999,
                                  background: badgeColor,
                                  color: "#fff",
                                  fontSize: "0.78rem",
                                  fontWeight: 800
                                }}
                              >
                                {candidate.party}
                              </span>

                              <span className="party-line">
                                {office?.name ?? candidate.officeId}
                              </span>
                            </div>

                            <p className="bio-copy">{candidate.bio}</p>
                          </div>
                        </div>
                      </div>

                      <div className="match-box">
                        <div className="match-label">Match</div>
                        <div className="match-value">{result.percentage}%</div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        display: "grid",
                        gap: "0.75rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                      }}
                    >
                      <div
                        style={{
                          padding: "0.9rem 1rem",
                          borderRadius: 14,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0"
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#166534", fontWeight: 700 }}>
                          Agreement
                        </div>
                        <div
                          style={{
                            marginTop: "0.35rem",
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#166534"
                          }}
                        >
                          {result.agreements.length}
                        </div>
                        <div style={{ marginTop: "0.2rem", color: "#166534", fontSize: "0.85rem" }}>
                          key issue matches
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "0.9rem 1rem",
                          borderRadius: 14,
                          background: "#fef2f2",
                          border: "1px solid #fecaca"
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#991b1b", fontWeight: 700 }}>
                          Differences
                        </div>
                        <div
                          style={{
                            marginTop: "0.35rem",
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#991b1b"
                          }}
                        >
                          {result.differences.length}
                        </div>
                        <div style={{ marginTop: "0.2rem", color: "#991b1b", fontSize: "0.85rem" }}>
                          major disagreements
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "0.9rem 1rem",
                          borderRadius: 14,
                          background: "#f8fafc",
                          border: "1px solid #dbe3ef"
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 700 }}>
                          Score
                        </div>
                        <div
                          style={{
                            marginTop: "0.35rem",
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#0f172a"
                          }}
                        >
                          {result.score}
                        </div>
                        <div style={{ marginTop: "0.2rem", color: "#64748b", fontSize: "0.85rem" }}>
                          weighted alignment points
                        </div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <ScopeScoreCard title="State-power alignment" item={result.scopeBreakdown.state} />
                      <ScopeScoreCard title="Federal-power alignment" item={result.scopeBreakdown.federal} />
                      <ScopeScoreCard title="Shared/local issues" item={result.scopeBreakdown.local_shared} />
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #dbe3ef"
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>Why this match</div>

                      {result.agreements.length === 0 ? (
                        <p style={{ marginTop: "0.6rem", color: "#64748b" }}>
                          No strong agreement topics recorded yet.
                        </p>
                      ) : (
                        <ul
                          style={{
                            marginTop: "0.75rem",
                            paddingLeft: "1.15rem",
                            color: "#475569",
                            lineHeight: 1.7
                          }}
                        >
                          {result.agreements.slice(0, 2).map((id: string) => (
                            <li key={id} style={{ marginBottom: "0.85rem" }}>
                              <strong>{questionMap[id]?.topic}</strong>
                              {questionMap[id]?.whyItMatters ? (
                                <div
                                  style={{
                                    marginTop: "0.25rem",
                                    color: "#1d4ed8",
                                    fontSize: "0.9rem"
                                  }}
                                >
                                  Why it matters: {questionMap[id].whyItMatters}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        borderRadius: 16,
                        background: "#fff7ed",
                        border: "1px solid #fed7aa"
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#9a3412" }}>Biggest differences</div>

                      {result.differences.length === 0 ? (
                        <p style={{ marginTop: "0.6rem", color: "#9a3412" }}>
                          No major differences recorded yet.
                        </p>
                      ) : (
                        <ul
                          style={{
                            marginTop: "0.75rem",
                            paddingLeft: "1.15rem",
                            color: "#7c2d12",
                            lineHeight: 1.7
                          }}
                        >
                          {result.differences.slice(0, 2).map((id: string) => (
                            <li key={id} style={{ marginBottom: "0.85rem" }}>
                              <strong>{questionMap[id]?.topic}</strong>
                              {questionMap[id]?.whyItMatters ? (
                                <div
                                  style={{
                                    marginTop: "0.25rem",
                                    color: "#c2410c",
                                    fontSize: "0.9rem"
                                  }}
                                >
                                  Why it matters: {questionMap[id].whyItMatters}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="topic-grid">
                      <TopicCard
                        title="Top alignment areas"
                        items={agreementTopics}
                        emptyText="No exact agreement topics recorded yet."
                        tone="success"
                      />
                      <TopicCard
                        title="Biggest differences"
                        items={differenceTopics}
                        emptyText="No major differences recorded yet."
                        tone="danger"
                      />
                    </div>

                    <div className="spacer-top">
                      <Link href={`/candidate/${candidate.id}`}>
                        <span className="btn-secondary">View candidate</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell results-shell">
          <div className="container">
            <div className="panel panel-lg">Loading results...</div>
          </div>
        </main>
      }
    >
      <ResultsPageInner />
    </Suspense>
  );
}

function ScopeScoreCard({ title, item }: { title: string; item: any }) {
  const hasData = item.possible > 0;

  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{hasData ? `${item.percentage}%` : "—"}</div>
      <div className="muted" style={{ marginTop: "0.3rem", fontSize: "0.86rem" }}>
        {hasData
          ? `${item.earned} of ${item.possible} weighted points`
          : "No scored questions in this scope"}
      </div>
    </div>
  );
}

function TopicCard({
  title,
  items,
  emptyText,
  tone
}: {
  title: string;
  items: string[];
  emptyText: string;
  tone: "success" | "danger";
}) {
  return (
    <div className={`topic-card ${tone}`}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p style={{ marginTop: "0.75rem" }}>{emptyText}</p>
      ) : (
        <ul className="topic-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
