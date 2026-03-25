// fix build
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCandidatesByOffice,
  getOffices,
  getQuestionsByOffice
} from "../../lib/loadData";
import { loadQuizAnswers } from "../../lib/quizStorage";
import { rankCandidates } from "../../lib/match";

export default function ResultsPage() {
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
    <main style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "Arial, sans-serif" }}>
      <section style={{ borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8" }}>
            Results
          </p>

          <h1 style={{ marginTop: "0.5rem", fontSize: "2rem", fontWeight: 700 }}>
            Your Candidate Matches
          </h1>

          <p style={{ marginTop: "0.75rem", maxWidth: 700, color: "#666", lineHeight: 1.6 }}>
            Ranked by how closely each candidate’s positions align with your
            answers for {office?.name ?? officeId}. Questions tied most directly
            to the office’s real governing power are weighted more heavily.
          </p>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href={`/quiz?office=${officeId}`}>
              <button
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                Retake quiz
              </button>
            </Link>

            <Link href="/">
              <button
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                Change office
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {results.length === 0 ? (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 16,
              background: "#fff",
              padding: "2rem"
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>No candidates found</h2>
            <p style={{ marginTop: "0.5rem", color: "#666" }}>
              Add candidate entries for this office to see ranked matches.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
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

              return (
                <div
                  key={candidate.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 16,
                    background: "#fff",
                    padding: "1.5rem"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      alignItems: "flex-start",
                      flexWrap: "wrap"
                    }}
                  >
                    <div style={{ maxWidth: 650 }}>
                      <p style={{ color: "#777", fontSize: "0.9rem" }}>#{idx + 1} Match</p>
                      <h2 style={{ marginTop: "0.25rem", fontSize: "1.6rem", fontWeight: 700 }}>
                        {candidate.name}
                      </h2>
                      <p style={{ marginTop: "0.25rem", color: "#666" }}>
                        {candidate.party} · {office?.name ?? candidate.officeId}
                      </p>
                      <p style={{ marginTop: "1rem", color: "#333", lineHeight: 1.6 }}>
                        {candidate.bio}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "1rem 1.25rem",
                        borderRadius: 16,
                        background: "#eff6ff",
                        textAlign: "center",
                        minWidth: 120
                      }}
                    >
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8" }}>
                        Match
                      </p>
                      <p style={{ marginTop: "0.25rem", fontSize: "2rem", fontWeight: 700, color: "#1e40af" }}>
                        {result.percentage}%
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "grid",
                      gap: "0.75rem",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
                    }}
                  >
                    <ScopeScoreCard title="State-power alignment" item={result.scopeBreakdown.state} />
                    <ScopeScoreCard title="Federal-power alignment" item={result.scopeBreakdown.federal} />
                    <ScopeScoreCard title="Shared/local issues" item={result.scopeBreakdown.local_shared} />
                  </div>

                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "grid",
                      gap: "1rem",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
                    }}
                  >
                    <TopicCard
                      title="Top alignment areas"
                      items={agreementTopics}
                      emptyText="No exact agreement topics recorded yet."
                      tone="green"
                    />
                    <TopicCard
                      title="Biggest differences"
                      items={differenceTopics}
                      emptyText="No major differences recorded yet."
                      tone="red"
                    />
                  </div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <Link href={`/candidate/${candidate.id}`}>
                      <button
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: 10,
                          border: "1px solid #ccc",
                          background: "#fff",
                          cursor: "pointer"
                        }}
                      >
                        View candidate
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ScopeScoreCard({ title, item }: { title: string; item: any }) {
  const hasData = item.possible > 0;

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#f5f5f5",
        padding: "1rem"
      }}
    >
      <p style={{ fontSize: "0.9rem", color: "#666" }}>{title}</p>
      <p style={{ marginTop: "0.5rem", fontSize: "1.7rem", fontWeight: 700 }}>
        {hasData ? `${item.percentage}%` : "—"}
      </p>
      <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#777" }}>
        {hasData
          ? `${item.earned} of ${item.possible} weighted points`
          : "No scored questions in this scope"}
      </p>
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
  tone: "green" | "red";
}) {
  const styles =
    tone === "green"
      ? { background: "#f0fdf4", border: "#bbf7d0", text: "#166534" }
      : { background: "#fef2f2", border: "#fecaca", text: "#991b1b" };

  return (
    <div
      style={{
        border: `1px solid ${styles.border}`,
        borderRadius: 16,
        background: styles.background,
        padding: "1rem"
      }}
    >
      <h3
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: styles.text
        }}
      >
        {title}
      </h3>

      {items.length === 0 ? (
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: styles.text }}>
          {emptyText}
        </p>
      ) : (
        <ul style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem", padding: 0, listStyle: "none" }}>
          {items.map((item) => (
            <li
              key={item}
              style={{
                padding: "0.65rem 0.8rem",
                borderRadius: 12,
                background: "rgba(255,255,255,0.7)",
                color: styles.text,
                fontSize: "0.9rem",
                fontWeight: 600
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
