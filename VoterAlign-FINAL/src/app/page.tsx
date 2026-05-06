"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getElection, getOfficesForZip } from "../lib/loadData";
import { clearQuizAnswers, saveMatchedOffices, saveSelectedTopics, saveSelectedZip } from "../lib/quizStorage";

export default function HomePage() {
  const router = useRouter();
  const election = getElection();
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [matched, setMatched] = useState<any[]>([]);
  const [zipChecked, setZipChecked] = useState(false);

  const splitStateOffices = useMemo(() => {
    const stateOnly = matched.filter((o: any) => o.id !== "governor" && o.level === "state");
    return stateOnly.length > 1 ? stateOnly : [];
  }, [matched]);

  function resetFlowState() { clearQuizAnswers(); saveSelectedTopics([]); }

  function lookupZip() {
    setError(""); setMatched([]); setZipChecked(false);
    if (!/^\d{5}$/.test(zip)) { setError("Please enter a valid 5-digit ZIP code."); return; }
    const offices = getOfficesForZip(zip);
    const nonGov = offices.filter((o: any) => o.id !== "governor");
    if (!offices.length || !nonGov.length) {
      setZipChecked(true);
      setError("We're expanding soon. Right now this tool covers Philadelphia-area voters.");
      return;
    }
    setMatched(offices); setZipChecked(true);
  }

  function continueWithOffices(offices: any[]) {
    resetFlowState();
    saveSelectedZip(zip);
    saveMatchedOffices(offices.map((o: any) => o.id));
    router.push("/topics");
  }

  return (
    <main className="page-shell">
      <div className="container bs-section">

        {/* Masthead */}
        <div className="bs-masthead">
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-pub-date">{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · Philadelphia, Pennsylvania</div>
          <div className="bs-title">VoterAlign</div>
          <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
          <div className="bs-masthead-footer">Nonpartisan · Transparent · Philadelphia 2026</div>
        </div>

        {/* ZIP entry */}
        <div className="bs-input-wrap">
          <label className="bs-input-label">Enter your Philadelphia ZIP code to find your ballot</label>
          <input
            className="bs-input"
            value={zip}
            onChange={e => setZip(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookupZip()}
            placeholder="e.g. 19103 · 19143 · 19120"
            maxLength={5}
            inputMode="numeric"
            autoComplete="postal-code"
          />
          {error && (
            <div style={{ marginTop: ".6rem", fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".9rem", color: "#7a1e1e" }}>{error}</div>
          )}
          <div style={{ marginTop: ".75rem" }}>
            <button className="btn-bs" onClick={lookupZip}>Find My Districts →</button>
          </div>
        </div>

        {/* Matched offices */}
        {matched.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div className="bs-race-header" style={{ marginBottom: 0 }}>
              <div className="bs-race-title">Your Ballot — ZIP {zip}</div>
              <div className="bs-race-meta">{matched.length} races found</div>
            </div>
            <div style={{ background: "var(--parchment-mid)", border: "1px solid var(--rule)", borderTop: "none", padding: "1rem" }}>
              {matched.map((o: any) => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: ".3rem 0", borderBottom: "1px dotted var(--rule-soft)", fontFamily: "'EB Garamond',serif", fontSize: ".95rem" }}>
                  <span style={{ color: "var(--ink-soft)" }}>{o.name}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gold)" }}>{o.level}</span>
                </div>
              ))}
              <div style={{ marginTop: ".85rem" }}>
                {splitStateOffices.length > 0 ? (
                  <>
                    <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".88rem", color: "var(--ink-mid)", marginBottom: ".6rem" }}>
                      Your ZIP crosses multiple state districts — select the one matching your neighborhood:
                    </div>
                    <div style={{ display: "grid", gap: ".4rem" }}>
                      {splitStateOffices.map((o: any) => {
                        const base = matched.filter((x: any) => x.id === "governor" || x.level === "federal");
                        return (
                          <button key={o.id} className="btn-bs-outline" onClick={() => continueWithOffices([...base, o])}>
                            Continue with {o.name} →
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <button className="btn-bs" onClick={() => continueWithOffices(matched)}>Continue to Topics →</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How it works + election info */}
        <div className="bs-how-grid">
          <div style={{ paddingRight: "1.25rem" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--gold)", borderBottom: "1px solid var(--rule)", paddingBottom: ".4rem", marginBottom: ".85rem" }}>
              How It Works
            </div>
            {[
              { n: "I.", title: "Enter your ZIP code", desc: "We find every race on your exact ballot" },
              { n: "II.", title: "Pick your issues", desc: "Transit, housing, education & more" },
              { n: "III.", title: "Answer plain questions", desc: "No jargon — takes about 2 minutes" },
              { n: "✦", title: "See your matches", desc: "Ranked by alignment, not party" },
            ].map((s, i) => (
              <div key={i} className="bs-how-step">
                <div className="bs-how-num">{s.n}</div>
                <div><div className="bs-how-title">{s.title}</div><div className="bs-how-desc">{s.desc}</div></div>
              </div>
            ))}
          </div>

          <div style={{ background: "repeating-linear-gradient(to bottom,var(--ink) 0,var(--ink) 4px,transparent 4px,transparent 8px)" }} />

          <div style={{ paddingLeft: "1.25rem" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--gold)", borderBottom: "1px solid var(--rule)", paddingBottom: ".4rem", marginBottom: ".85rem" }}>
              Election Information
            </div>
            <div className="bs-election-table">
              {[
                { label: "Primary Election Date", value: election?.date ? new Date(election.date + "T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "May 19, 2026" },
                { label: "Voter Registration", value: "By May 4, 2026" },
                { label: "Mail-In Ballot", value: "By May 12, 2026" },
                { label: "Polling Hours", value: election?.pollingHours ?? "7 AM – 8 PM" },
              ].map((r, i) => (
                <div key={i} className="bs-election-row">
                  <span className="bs-election-label">{r.label}</span>
                  <span className="bs-election-value">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="bs-info-box">
              This publication is nonpartisan. No candidate or party has paid for placement. All positions are sourced from public records and campaign statements.
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
