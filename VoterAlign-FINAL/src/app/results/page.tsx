"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { getCandidatesByOffices, getOffices, getQuestionsByOfficesAndTopics } from "../../lib/loadData";
import { loadMatchedOffices, loadQuizAnswers, loadSelectedTopics } from "../../lib/quizStorage";
import { rankCandidates } from "../../lib/match";
import ShareButton from "../../components/ShareButton";

const TOPIC_ICONS: Record<string,string> = { "Transit Funding":"🚌","Minimum Wage":"💰","Housing":"🏠","Education":"🎓","Social Security":"👴","Voting Rights":"🗳️","Gun Safety":"🛡️","Climate Action":"🌎" };

function ResultsInner() {
  const answers        = useMemo(() => loadQuizAnswers(), []);
  const matchedOffices = useMemo(() => loadMatchedOffices(), []);
  const selectedTopics = useMemo(() => loadSelectedTopics(), []);
  const offices        = getOffices();
  const questions      = getQuestionsByOfficesAndTopics(matchedOffices, selectedTopics);
  const candidates     = getCandidatesByOffices(matchedOffices);
  const officeMap      = useMemo(() => Object.fromEntries(offices.map((o: any) => [o.id, o])), [offices]);
  const questionMap    = useMemo(() => Object.fromEntries(questions.map((q: any) => [q.id, q])), [questions]);

  const resultsByOffice = useMemo(() => matchedOffices.map(officeId => {
    const oc = candidates.filter((c: any) => c.officeId === officeId);
    const oq = questions.filter((q: any) => q.relevantOfficeIds?.includes(officeId));
    if (!oq.length) return null;
    const ranked = rankCandidates(oc, oq, answers, selectedTopics);
    if (!ranked.length) return null;
    return { officeId, office: officeMap[officeId], officeCandidates: oc, officeQuestions: oq, results: ranked };
  }).filter(Boolean) as any[], [matchedOffices, candidates, questions, answers, selectedTopics, officeMap]);

  const topMatches = useMemo(() => resultsByOffice.map(g => {
    const top = g.results[0];
    const c = candidates.find((x: any) => x.id === top?.candidateId);
    if (!c) return null;
    return { name: c.name, percentage: top.percentage, office: g.office?.name ?? g.officeId };
  }).filter(Boolean) as { name: string; percentage: number; office: string }[], [resultsByOffice, candidates]);

  return (
    <main className="page-shell">
      <div className="container bs-section">

        {/* Masthead */}
        <div className="bs-masthead">
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-pub-date">Primary Election · May 19, 2026 · Philadelphia, Pennsylvania</div>
          <div className="bs-title">VoterAlign</div>
          <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
          <div className="bs-masthead-footer">Nonpartisan · Transparent · Ranked by alignment, not party</div>
        </div>

        {/* Topics + actions */}
        {selectedTopics.length > 0 && (
          <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".75rem" }}>
            <div className="bs-chip-row" style={{ margin: 0 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)" }}>Your issues:</span>
              {selectedTopics.map(t => <span key={t} className="bs-chip">{TOPIC_ICONS[t] || "📌"} {t}</span>)}
            </div>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {topMatches.length > 0 && <ShareButton topMatches={topMatches} topics={selectedTopics} />}
              <Link href="/topics"><button className="bs-action-link">Change topics</button></Link>
              <Link href="/"><button className="bs-action-link">Start over</button></Link>
            </div>
          </div>
        )}

        {/* Results */}
        {resultsByOffice.length === 0 ? (
          <div style={{ border: "1px solid var(--rule)", padding: "1.5rem", background: "var(--parchment-mid)", fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>
            No candidates found for the selected offices and issues.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            {resultsByOffice.map(group => {
              const isUnopposed = group.officeCandidates.length === 1;
              return (
                <div key={group.officeId}>
                  <div className="bs-race-header">
                    <div className="bs-race-title">{group.office?.name ?? group.officeId}</div>
                    <div className="bs-race-meta">
                      {group.results.length} candidate{group.results.length !== 1 ? "s" : ""} · Ranked by alignment
                      {isUnopposed ? " · Unopposed" : ""}
                    </div>
                  </div>

                  <div className="bs-card" style={{ padding: 0, marginBottom: 0 }}>
                    {/* Two-col for 2 candidates, single col otherwise */}
                    {group.results.length === 2 ? (
                      <div style={{ padding: "1.25rem" }}>
                        <div className="bs-grid">
                          {group.results.map((result: any, idx: number) => {
                            const c = candidates.find((x: any) => x.id === result.candidateId);
                            if (!c) return null;
                            const isDem = c.partyColor === "blue";
                            const isRep = c.partyColor === "red";
                            const positions = c.positions as Record<string,any> | undefined;
                            return (
                              <div key={c.id} className="bs-col">
                                {idx === 0 && <div className="bs-best-banner">✦ Best Match</div>}
                                <div className="bs-cand-head">
                                  <div className="bs-cand-name">{c.name}</div>
                                  <div>
                                    <span className={`bs-score ${result.percentage >= 60 ? "high" : "low"}`}>{result.percentage}</span>
                                    <span className="bs-score-lbl">%</span>
                                  </div>
                                </div>
                                <div className="bs-byline">
                                  <span className={isDem ? "bs-party-dem" : isRep ? "bs-party-rep" : ""}>● {c.party}</span>
                                  <span>·</span><span>{group.office?.name}</span>
                                  {isUnopposed && <><span>·</span><span>Unopposed</span></>}
                                </div>
                                <p className={`bs-body${idx === 0 ? " dropcap" : ""}`}>{c.bio}</p>
                                <table className="bs-issue-table">
                                  {group.officeQuestions.slice(0, 4).map((q: any) => {
                                    const pos = positions?.[q.id];
                                    const stance = pos?.stance ?? 0;
                                    return (
                                      <tr key={q.id}>
                                        <td>{TOPIC_ICONS[q.topic] || "📌"} {q.topic}</td>
                                        <td className={stance === 1 ? "td-agree" : stance === -1 ? "td-oppose" : "td-neutral"}>
                                          {stance === 1 ? "✓ Agrees" : stance === -1 ? "✕ Opposes" : "~ Neutral"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </table>
                                <Link href={`/candidate/${c.id}`}><span className="bs-read-more">Read full record →</span></Link>
                              </div>
                            );
                          })}
                          <div className="bs-col-rule" />
                        </div>
                      </div>
                    ) : (
                      // Single candidate
                      group.results.map((result: any, idx: number) => {
                        const c = candidates.find((x: any) => x.id === result.candidateId);
                        if (!c) return null;
                        const isDem = c.partyColor === "blue";
                        const isRep = c.partyColor === "red";
                        const positions = c.positions as Record<string,any> | undefined;
                        return (
                          <div key={c.id} style={{ padding: "1.25rem", borderBottom: idx < group.results.length - 1 ? "1px solid var(--rule)" : "none" }}>
                            {idx === 0 && <div className="bs-best-banner">✦ Best Match</div>}
                            <div className="bs-cand-head">
                              <div className="bs-cand-name">{c.name}</div>
                              <div>
                                <span className={`bs-score ${result.percentage >= 60 ? "high" : "low"}`}>{result.percentage}</span>
                                <span className="bs-score-lbl">%</span>
                              </div>
                            </div>
                            <div className="bs-byline">
                              <span className={isDem ? "bs-party-dem" : isRep ? "bs-party-rep" : ""}>● {c.party}</span>
                              <span>·</span><span>{group.office?.name}</span>
                              {isUnopposed && <><span>·</span><span>Unopposed</span></>}
                            </div>
                            <p className="bs-body dropcap">{c.bio}</p>
                            <table className="bs-issue-table">
                              {group.officeQuestions.slice(0, 4).map((q: any) => {
                                const pos = positions?.[q.id];
                                const stance = pos?.stance ?? 0;
                                return (
                                  <tr key={q.id}>
                                    <td>{TOPIC_ICONS[q.topic] || "📌"} {q.topic}</td>
                                    <td className={stance === 1 ? "td-agree" : stance === -1 ? "td-oppose" : "td-neutral"}>
                                      {stance === 1 ? "✓ Agrees" : stance === -1 ? "✕ Opposes" : "~ Neutral"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </table>
                            <Link href={`/candidate/${c.id}`}><span className="bs-read-more">Read full record →</span></Link>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="page-shell"><div className="container bs-section" style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", color: "var(--ink-mid)" }}>Loading your results...</div></main>}>
      <ResultsInner />
    </Suspense>
  );
}
