"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import {
  getCandidatesByOffices,
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
  const matchedOffices = loadMatchedOffices();
  const selectedTopics = loadSelectedTopics();

  const questions = getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics);
  const candidates = getCandidatesByOffices(matchedOffices);
  const results = rankCandidates(candidates, questions, answers, selectedTopics);

  const questionMap = useMemo(() => {
    return Object.fromEntries(questions.map((q: any) => [q.id, q]));
  }, [questions]);

  return (
    <main className="page-shell results-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Results</span>
          <h1 className="header-title">Your best candidate matches</h1>
          <p className="section-copy">
            Ranked using your ZIP code, selected topics, and issue answers.
          </p>

          <div className="chip-row">
            {selectedTopics.map((topic) => (
              <span key={topic} className="chip">
                {topic}
              </span>
            ))}
          </div>

          <div className="chip-row">
            <Link href="/topics">
              <span className="btn-secondary">Change topics</span>
            </Link>
            <Link href="/">
              <span className="btn-secondary">Start over</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {results.length === 0 ? (
            <div className="panel panel-lg">No candidates found for your matched offices yet.</div>
          ) : (
            <div className="results-list">
              {results.map((result: any, idx: number) => {
                const candidate = candidates.find((c: any) => c.id === result.candidateId);
                if (!candidate) return null;

                const borderColor =
                  candidate.partyColor === "blue"
                    ? "#2563eb"
                    : candidate.partyColor === "red"
                    ? "#dc2626"
                    : "#dbe3ef";

                return (
                  <div
                    key={candidate.id}
                    className="result-card"
                    style={{
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: "16px"
                    }}
                  >
                    <div className="result-top">
                      <div style={{ flex: 1 }}>
                        <div className="rank-badge">#{idx + 1} Match</div>
                        <h2 className="result-name">{candidate.name}</h2>
                        <p className="party-line">{candidate.party}</p>
                        <p className="bio-copy">{candidate.bio}</p>
                      </div>

                      <div className="match-box">
                        <div className="match-label">Match</div>
                        <div className="match-value">{result.percentage}%</div>
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
