"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getElection, getOfficesForZip } from "../lib/loadData";
import {
  clearQuizAnswers,
  saveMatchedOffices,
  saveSelectedTopics,
  saveSelectedZip
} from "../lib/quizStorage";

export default function HomePage() {
  const router = useRouter();
  const election = getElection();

  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [matched, setMatched] = useState<any[]>([]);
  const [zipChecked, setZipChecked] = useState(false);

  const splitStateOffices = useMemo(() => {
    const stateOnly = matched.filter(
      (office: any) => office.id !== "governor" && office.level === "state"
    );
    return stateOnly.length > 1 ? stateOnly : [];
  }, [matched]);

  function resetFlowState() {
    clearQuizAnswers();
    saveSelectedTopics([]);
  }

  function lookupZip() {
    setError("");
    setMatched([]);
    setZipChecked(false);

    if (!/^\d{5}$/.test(zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    const offices = getOfficesForZip(zip);

    // Only governor means ZIP is outside current mapped coverage
    const nonGovernorMatches = offices.filter((office: any) => office.id !== "governor");

    if (offices.length === 0 || nonGovernorMatches.length === 0) {
      setZipChecked(true);
      setError(
        "We’re expanding soon. Right now, this tool is built for Philadelphia-area voters."
      );
      return;
    }

    setMatched(offices);
    setZipChecked(true);
  }

  function continueWithOffices(officesToUse: any[]) {
    const officeIds = officesToUse.map((o: any) => o.id);

    resetFlowState();
    saveSelectedZip(zip);
    saveMatchedOffices(officeIds);

    router.push("/topics");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div className="panel panel-lg">
            <span className="eyebrow">Philadelphia 2026</span>
            <h1 className="hero-title">Philly 2026: Your City, Your Choice.</h1>
            <p className="hero-copy">
              Enter your ZIP code to find the offices on your ballot, then answer a
              short, focused assessment to see which candidates align with your priorities.
            </p>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Election date</div>
                <div className="stat-value">{election.date}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Location</div>
                <div className="stat-value">{election.location}</div>
              </div>
            </div>
          </div>

          <div className="panel panel-lg">
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
              Find your ballot
            </h2>

            <p className="section-copy" style={{ marginTop: "0.5rem" }}>
              Start with your 5-digit ZIP code.
            </p>

            <div style={{ marginTop: "1rem" }}>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Enter 5-digit ZIP code"
                maxLength={5}
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  fontSize: "1rem"
                }}
              />
            </div>

            {error ? (
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 12,
                  background: zipChecked ? "#fff7ed" : "#fef2f2",
                  border: `1px solid ${zipChecked ? "#fed7aa" : "#fecaca"}`,
                  color: zipChecked ? "#9a3412" : "#b91c1c",
                  fontSize: "0.92rem",
                  lineHeight: 1.45
                }}
              >
                {error}
              </div>
            ) : null}

            <div className="spacer-top">
              <button className="btn" onClick={lookupZip}>
                Find my districts
              </button>
            </div>

            {matched.length > 0 ? (
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                  Matched offices
                </h3>

                <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                  {matched.map((office: any) => (
                    <div key={office.id} className="stat-card">
                      <div className="stat-label">{office.level}</div>
                      <div className="stat-value">{office.name}</div>
                    </div>
                  ))}
                </div>

                {splitStateOffices.length > 0 ? (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#334155",
                        fontSize: "0.92rem",
                        lineHeight: 1.45
                      }}
                    >
                      Your ZIP may cross multiple state districts. Choose the option
                      that best matches your neighborhood.
                    </div>

                    <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                      {splitStateOffices.map((office: any) => {
                        const base = matched.filter(
                          (item: any) =>
                            item.id === "governor" || item.level === "federal"
                        );

                        return (
                          <button
                            key={office.id}
                            className="btn-secondary"
                            onClick={() => continueWithOffices([...base, office])}
                            style={{ textAlign: "left" }}
                          >
                            Continue with {office.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="spacer-top">
                    <button className="btn" onClick={() => continueWithOffices(matched)}>
                      Continue
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
