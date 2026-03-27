"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import {
  getCandidatesByOffices,
  getOffices,
  getQuestionsByOfficesAndTopics
} from "../../lib/loadData";
import {
  loadMatchedOffices,
  loadQuizAnswers,
  loadSelectedTopics
} from "../../lib/quizStorage";
import { rankCandidates } from "../../lib/match";

function ResultsPageInner() {
  const answers = useMemo(() => loadQuizAnswers(), []);
  const matchedOffices = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics = useMemo(() => loadSelectedTopics(), []);

  const offices = getOffices();
  const questions = getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics);
  const candidates = getCandidatesByOffices(matchedOffices);

  const questionMap = useMemo(() => {
    return Object.fromEntries(questions.map((q: any) => [q.id, q]));
  }, [questions]);

  const officeMap = useMemo(() => {
    return Object.fromEntries(offices.map((o: any) => [o.id, o]));
  }, [offices]);

  const resultsByOffice = useMemo(() => {
    return matchedOffices
      .map((officeId) => {
        const officeCandidates = candidates.filter((c: any) => c.officeId === officeId);
        const officeQuestions = questions.filter((q: any) =>
          q.relevantOfficeIds?.includes(officeId)
        );

        const ranked = rankCandidates(
          officeCandidates,
          officeQuestions,
          answers,
          selectedTopics
        );

        return {
          officeId,
          office: officeMap[officeId],
          officeCandidates,
          results: ranked
        };
      })
      .filter((group) => group.results.length > 0);
  }, [matchedOffices, candidates, questions, answers, selectedTopics, officeMap]);

  return (
    <main className="page-shell results-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Your Ballot Matches</span>
          <h1 className="header-title">Candidates matched to your priorities</h1>
          <p className="section-copy">
            Based on your ZIP code and top issues, here are the candidates who align
            most with you in each race.
          </p>

          {selectedTopics.length > 0 ? (
            <div className="chip-row">
              {selectedTopics.map((topic) => (
                <span key={topic} className="chip">
                  {topic}
                </span>
              ))}
            </div>
          ) : null}

          <div className="chip-row">
            <Link href="/topics">
              <span className="btn-secondary">Change top 3 issues</span>
            </Link>
            <Link href="/">
              <span className="btn-secondary">Start over</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {resultsByOffice.length === 0 ? (
            <div className="panel panel-lg">
              No candidates found for your matched offices yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "2rem" }}>
              {resultsByOffice.map((group) => {
                const isUnopposed = group.officeCandidates.length === 1;

                return (
                  <section key={group.officeId}>
                    <div
                      style={{
                        marginBottom: "1rem",
                        paddingBottom: "0.75rem",
                        borderBottom: "1px solid #dbe3ef"
                      }}
                    >
                      <div className="eyebrow">Office Match</div>
                      <h2
                        style={{
                          marginTop: "0.35rem",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: "#0f172a"
                        }}
                      >
                        {group.office?.name ?? group.officeId}
                      </h2>

                      <p
                        style={{
                          marginTop: "0.35rem",
                          color: "#64748b",
                          fontSize: "0.95rem"
                        }}
                      >
                        Ranked by how closely each candidate aligns with your selected
                        priorities in this race.
                      </p>

                      {isUnopposed ? (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            padding: "0.85rem 1rem",
                            borderRadius: 12,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                            fontSize: "0.9rem",
                            lineHeight: 1.5
                          }}
                        >
                          There is currently only one candidate in this race, which
                          reflects your real ballot.
                        </div>
                      ) : null}
                    </div>

                    <div className="results-list">
                      {group.results.map((result: any, idx: number) => {
                        const candidate = candidates.find(
                          (c: any) => c.id === result.candidateId
                        );
                        if (!candidate) return null;

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

                        const initials = candidate.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2);

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
                                  ? "0 14px 36px rgba(15, 23, 42, 0.10)"
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
                                Best match for this office
                              </div>
                            ) : null}

                            <div className="result-top">
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "1rem",
                                    alignItems: "flex-start"
                                  }}
                                >
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
                                    {initials}
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <div className="rank-badge">#{idx + 1} in this race</div>

                                    <h3
                                      style={{
                                        marginTop: "0.35rem",
                                        fontSize: "1.35rem",
                                        fontWeight: 800,
                                        color: "#0f172a",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        flexWrap: "wrap"
                                      }}
                                    >
                                      {candidate.name}

                                      {isUnopposed ? (
                                        <span
                                          style={{
                                            fontSize: "0.72rem",
                                            background: "#e2e8f0",
                                            color: "#334155",
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "999px",
                                            fontWeight: 700
                                          }}
                                        >
                                          Unopposed
                                        </span>
                                      ) : null}
                                    </h3>

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
                                        {group.office?.name ?? candidate.officeId}
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
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#166534",
                                    fontWeight: 700
                                  }}
                                >
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
                                <div
                                  style={{
                                    marginTop: "0.2rem",
                                    color: "#166534",
                                    fontSize: "0.85rem"
                                  }}
                                >
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
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#991b1b",
                                    fontWeight: 700
                                  }}
                                >
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
                                <div
                                  style={{
                                    marginTop: "0.2rem",
                                    color: "#991b1b",
                                    fontSize: "0.85rem"
                                  }}
                                >
                                  major disagreements
                                </div>
                              </div>
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
                              <div style={{ fontWeight: 800, color: "#0f172a" }}>
                                Why this match
                              </div>

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
                                  {result.agreements.slice(0, 3).map((id: string) => (
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
                              <div style={{ fontWeight: 800, color: "#9a3412" }}>
                                Biggest differences
                              </div>

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
                                  {result.differences.slice(0, 3).map((id: string) => (
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

                            <div className="spacer-top">
                              <Link href={`/candidate/${candidate.id}`}>
                                <span className="btn-secondary">View candidate</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
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
