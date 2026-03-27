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

  const splitStateOffices = useMemo(() => {
    const stateOnly = matched.filter(
      (office: any) => office.id !== "governor" && office.level === "state"
    );
    return stateOnly.length > 1 ? stateOnly : [];
  }, [matched]);

  function lookupZip() {
    setError("");

    if (!/^\d{5}$/.test(zip)) {
      setError("Please enter a valid 5-digit Philadelphia ZIP code.");
      return;
    }

    const offices = getOfficesForZip(zip);

    if (!offices || offices.length === 0) {
      setError("No offices found for that ZIP yet.");
      return;
    }

    setMatched(offices);
  }

  function continueWithOffices(officesToUse: any[]) {
    const officeIds = officesToUse.map((o: any) => o.id);

    clearQuizAnswers();
    saveSelectedZip(zip);
    saveMatchedOffices(officeIds);
    saveSelectedTopics([]);

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
              Enter your ZIP code to find the offices that apply to you, then
              answer a short issue-based assessment to see which candidates align
              with your priorities.
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
            <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
              Find your ballot
            </h2>

            <p className="section-copy">
              Start with your Philadelphia ZIP code.
            </p>

            <div style={{ marginTop: "1rem" }}>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Enter 5-digit ZIP code"
                maxLength={5}
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
              <p style={{ marginTop: "0.75rem", color: "#b91c1c" }}>{error}</p>
            ) : null}

            <div className="spacer-top">
              <button className="btn" onClick={lookupZip}>
                Find my districts
              </button>
            </div>

            {matched.length > 0 ? (
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Matched offices</h3>

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
                    <p className="section-copy">
                      Your ZIP may cross multiple state districts. Pick the one that
                      best matches your neighborhood for now.
                    </p>

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
