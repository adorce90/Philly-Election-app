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
import ShareButton from "../../components/ShareButton";

function ResultsPageInner() {
  const answers = useMemo(() => loadQuizAnswers(), []);
  const matchedOffices = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics = useMemo(() => loadSelectedTopics(), []);

  const offices = getOffices();
  const questions = getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics);
  const candidates = getCandidatesByOffices(matchedOffices);

  const questionMap = useMemo(
    () => Object.fromEntries(questions.map((q: any) => [q.id, q])),
    [questions]
  );

  const officeMap = useMemo(
    () => Object.fromEntries(offices.map((o: any) => [o.id, o])),
    [offices]
  );

  const resultsByOffice = useMemo(() => {
    return matchedOffices
      .map((officeId) => {
        const officeCandidates = candidates.filter((c: any) => c.officeId === officeId);
        const officeQuestions = questions.filter((q: any) =>
          q.relevantOfficeIds?.includes(officeId)
        );
        if (officeQuestions.length === 0) return null;
        const ranked = rankCandidates(officeCandidates, officeQuestions, answers, selectedTopics);
        if (ranked.length === 0) return null;
        return { officeId, office: officeMap[officeId], officeCandidates, officeQuestions, results: ranked };
      })
      .filter(Boolean) as any[];
  }, [matchedOffices, candidates, questions, answers, selectedTopics, officeMap]);

  // Build top matches list for share button
  const topMatches = useMemo(() => {
    return resultsByOffice
      .map((group) => {
        const top = group.results[0];
        const candidate = candidates.find((c: any) => c.id === top?.candidateId);
        if (!candidate) return null;
        return {
          name: candidate.name,
          percentage: top.percentage,
          office: group.office?.name ?? group.officeId
        };
      })
      .filter(Boolean) as { name: string; percentage: number; office: string }[];
  }, [resultsByOffice, candidates]);

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

          {selectedTopics.length > 0 && (
            <div className="chip-row">
              {selectedTopics.map((topic) => (
                <span key={topic} className="chip">{topic}</span>
              ))}
            </div>
          )}

          <div className="chip-row" style={{ marginTop: "1rem", flexWrap: "wrap", gap: "0.65rem" }}>
            {/* Share button — primary CTA */}
            {topMatches.length > 0 && (
              <ShareButton topMatches={topMatches} topics={selectedTopics} />
            )}
            <Link href="/topics">
              <span className="btn-secondary" style={{ fontSize: "0.88rem" }}>Change topics</span>
            </Link>
            <Link href="/">
              <span className="btn-secondary" style={{ fontSize: "0.88rem" }}>Start over</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {resultsByOffice.length === 0 ? (
            <div className="panel panel-lg">
              No candidates found for the offices and issues currently selected.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "2.5rem" }}>
              {resultsByOffice.map((group) => {
                const isUnopposed = group.officeCandidates.length === 1;

                return (
                  <section key={group.officeId}>
                    <div style={{ marginBottom: "1.1rem", paddingBottom: "0.85rem", borderBottom: "1px solid var(--border-soft)" }}>
                      <span className="eyebrow">Race</span>
                      <h2 style={{ margin: "0.4rem 0 0", fontFamily: "'Lora', Georgia, serif", fontSize: "1.45rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" }}>
                        {group.office?.name ?? group.officeId}
                      </h2>
                      <p style={{ marginTop: "0.35rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Ranked by alignment with your selected priorities.
                      </p>
                      {isUnopposed && (
                        <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", borderRadius: 12, background: "var(--surface-muted)", border: "1px solid var(--border-soft)", color: "var(--text-soft)", fontSize: "0.88rem" }}>
                          Only one candidate is currently in this race — this reflects your actual ballot.
                        </div>
                      )}
                    </div>

                    <div className="results-list">
                      {group.results.map((result: any, idx: number) => {
                        const candidate = candidates.find((c: any) => c.id === result.candidateId);
                        if (!candidate) return null;

                        const isTopMatch = idx === 0;
                        const partyBg = candidate.partyColor === "blue" ? "#1d4ed8" : candidate.partyColor === "red" ? "#dc2626" : "var(--text-muted)";
                        const cardBorder = candidate.partyColor === "blue" ? "#93c5fd" : candidate.partyColor === "red" ? "#fca5a5" : "var(--border)";

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
                              border: `${isTopMatch ? "2px" : "1.5px"} solid ${cardBorder}`,
                              borderRadius: 20,
                              boxShadow: isTopMatch ? "var(--shadow-md)" : "var(--shadow-sm)"
                            }}
                          >
                            {isTopMatch && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.32rem 0.75rem", borderRadius: 999, background: "var(--primary-soft)", border: "1px solid rgba(61,138,113,0.25)", color: "var(--primary-dark)", fontWeight: 700, fontSize: "0.78rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                ✓ Best match
                              </div>
                            )}

                            <div className="result-top">
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--surface-muted)", border: `2px solid ${cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-soft)", flexShrink: 0, fontFamily: "'Lora', Georgia, serif" }}>
                                    {initials}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div className="rank-badge">#{idx + 1} in this race</div>
                                    <h3 style={{ margin: "0.3rem 0 0", fontFamily: "'Lora', Georgia, serif", fontSize: "1.3rem", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                      {candidate.name}
                                      {isUnopposed && (
                                        <span style={{ fontSize: "0.7rem", background: "var(--surface-muted)", color: "var(--text-muted)", padding: "0.18rem 0.5rem", borderRadius: 999, fontWeight: 700 }}>
                                          Unopposed
                                        </span>
                                      )}
                                    </h3>
                                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.65rem", borderRadius: 999, background: partyBg, color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
                                        {candidate.party}
                                      </span>
                                      <span className="party-line">{group.office?.name ?? candidate.officeId}</span>
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

                            {result.agreements.length > 0 && (
                              <div style={{ marginTop: "1.1rem", padding: "1rem 1.1rem", borderRadius: 14, background: "var(--surface-muted)", border: "1px solid var(--border-soft)" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                  Why this match
                                </div>
                                <ul style={{ marginTop: "0.65rem", paddingLeft: "1.1rem", color: "var(--text-soft)", lineHeight: 1.75, marginBottom: 0 }}>
                                  {result.agreements.slice(0, 3).map((id: string) => (
                                    <li key={id} style={{ marginBottom: "0.5rem" }}>
                                      <strong style={{ color: "var(--text)" }}>{questionMap[id]?.topic}</strong>
                                      {questionMap[id]?.whyItMatters && (
                                        <div style={{ marginTop: "0.2rem", color: "var(--primary-dark)", fontSize: "0.88rem" }}>
                                          {questionMap[id].whyItMatters}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="spacer-top">
                              <Link href={`/candidate/${candidate.id}`}>
                                <span className="btn-secondary" style={{ fontSize: "0.9rem" }}>View full profile →</span>
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
    <Suspense fallback={
      <main className="page-shell results-shell">
        <div className="container"><div className="panel panel-lg" style={{ marginTop: "2rem" }}>Loading your results...</div></div>
      </main>
    }>
      <ResultsPageInner />
    </Suspense>
  );
}
