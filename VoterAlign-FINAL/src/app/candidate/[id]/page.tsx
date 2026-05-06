"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getCandidateById, getOffices, getQuestionsByOffice } from "../../../lib/loadData";

const TOPIC_ICONS: Record<string,string> = { "Transit Funding":"🚌","Minimum Wage":"💰","Housing":"🏠","Education":"🎓","Social Security":"👴","Voting Rights":"🗳️","Gun Safety":"🛡️","Climate Action":"🌎" };

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const router    = useRouter();
  const candidate = getCandidateById(params.id);
  if (!candidate) notFound();

  const offices   = getOffices();
  const office    = offices.find((o: any) => o.id === candidate.officeId);
  const questions = getQuestionsByOffice(candidate.officeId);
  const positions = candidate.positions as Record<string,any> | undefined;

  const isDem = candidate.partyColor === "blue";
  const isRep = candidate.partyColor === "red";

  const tracked   = questions.filter((q: any) => positions?.[q.id]);
  const agrees    = tracked.filter((q: any) => positions?.[q.id]?.stance === 1).length;
  const opposes   = tracked.filter((q: any) => positions?.[q.id]?.stance === -1).length;
  const neutrals  = tracked.filter((q: any) => positions?.[q.id]?.stance === 0).length;

  return (
    <main className="page-shell">
      <div className="container bs-section">

        {/* Back */}
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={() => router.back()} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gold)", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid var(--gold)", padding: 0 }}>
            ← Back to results
          </button>
        </div>

        {/* Detail shell */}
        <div className="bs-detail-shell">
          {/* Top bar */}
          <div className="bs-detail-topbar">
            <div className="bs-detail-topbar-label">Candidate Record</div>
            <div className="bs-detail-topbar-meta">{office?.name ?? candidate.officeId} · {office?.level ?? "Office"}</div>
          </div>

          <div className="bs-detail-body">
            {/* Hero */}
            <div className="bs-detail-hero">
              <div>
                <div className="bs-detail-kicker">Full Name & Title</div>

                {/* ✅ Clean upright name — DM Sans */}
                <div className="bs-detail-cand-name">{candidate.name}</div>

                <div className="bs-detail-office">{office?.name ?? candidate.officeId}</div>
                <div className={isDem ? "bs-detail-party-dem" : isRep ? "bs-detail-party-rep" : ""}>● {candidate.party}</div>
                <div className="bs-detail-bio">{candidate.bio}</div>
                {"website" in candidate && typeof (candidate as any).website === "string" && (candidate as any).website && (
                  <div style={{ marginTop: "1rem" }}>
                    <a href={(candidate as any).website} target="_blank" rel="noreferrer" className="bs-read-more">Campaign website →</a>
                  </div>
                )}
              </div>

              <div className="bs-detail-score-box">
                <div className="bs-detail-score-label">Positions on Record</div>
                <div className="bs-detail-score-num">{tracked.length}</div>
                <div className="bs-detail-score-sub">{agrees} support · {opposes} oppose · {neutrals} neutral</div>
              </div>
            </div>

            {/* Stats */}
            <div className="bs-detail-stats">
              <div className="bs-stat-box">
                <div className="bs-stat-num">{tracked.length}</div>
                <div className="bs-stat-lbl">Tracked</div>
              </div>
              <div className="bs-stat-box" style={{ background: "var(--agree-bg)", borderColor: "var(--agree-rule)" }}>
                <div className="bs-stat-num" style={{ color: "var(--agree)" }}>{agrees}</div>
                <div className="bs-stat-lbl" style={{ color: "var(--agree)" }}>Supports</div>
              </div>
              <div className="bs-stat-box" style={{ background: "var(--oppose-bg)", borderColor: "var(--oppose-rule)" }}>
                <div className="bs-stat-num" style={{ color: "var(--oppose)" }}>{opposes}</div>
                <div className="bs-stat-lbl" style={{ color: "var(--oppose)" }}>Opposes</div>
              </div>
            </div>

            {/* Issue record */}
            <div className="bs-issue-section-title">Position Record — Issue by Issue</div>
            <div style={{ marginBottom: "1.25rem" }}>
              {tracked.map((q: any) => {
                const pos    = positions?.[q.id];
                const stance = pos?.stance ?? 0;
                return (
                  <div key={q.id} className="bs-issue-row">
                    <span className="bs-issue-icon">{TOPIC_ICONS[q.topic] || "📌"}</span>
                    <div>
                      <div className="bs-issue-q">{q.text}</div>
                      {pos?.sourceLabel && <div className="bs-issue-source">Source: {pos.sourceLabel}</div>}
                      {pos?.quote && (
                        <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".85rem", color: "var(--ink-mid)", marginTop: ".3rem", borderLeft: "2px solid var(--gold)", paddingLeft: ".6rem" }}>
                          "{pos.quote}"
                        </div>
                      )}
                    </div>
                    <span className={`bs-verdict ${stance === 1 ? "agree" : stance === -1 ? "oppose" : "neutral"}`}>
                      {stance === 1 ? "✓ Supports" : stance === -1 ? "✕ Opposes" : "~ Neutral"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Record footer */}
            <div className="bs-record-footer">
              <div className="bs-record-footer-note">End of record — {tracked.length} positions documented</div>
              <div className="bs-record-tally">{agrees} ✓ · {opposes} ✕ · {neutrals} ~</div>
            </div>

            {/* Coming soon */}
            <div className="bs-coming-soon">
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".6rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)", marginBottom: ".3rem" }}>Coming Soon</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: ".3rem" }}>Promise Tracker</div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".9rem", color: "var(--gold)" }}>
                A record of what candidates promise versus how they actually vote — published after the election.
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
