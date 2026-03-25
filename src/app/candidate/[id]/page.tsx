import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCandidateById,
  getOffices,
  getQuestionsByOffice
} from "../../../lib/loadData";


function stanceTone(label?: string) {
  switch (label) {
    case "Support":
      return {
        bg: "#f0fdf4",
        border: "#bbf7d0",
        text: "#166534"
      };
    case "Oppose":
      return {
        bg: "#fef2f2",
        border: "#fecaca",
        text: "#991b1b"
      };
    default:
      return {
        bg: "#f5f5f5",
        border: "#e5e5e5",
        text: "#555"
      };
  }
}

export default function CandidateDetailPage({
  params
}: {
  params: { id: string };
}) {
  const candidate = getCandidateById(params.id);

  if (!candidate) {
    notFound();
  }

  const offices = getOffices();
  const office = offices.find((item: any) => item.id === candidate.officeId);
  const questions = getQuestionsByOffice(candidate.officeId);

  const candidateQuestions = questions.filter(
    (question: any) => candidate.positions?.[question.id]
  );

  return (
    <main style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "Arial, sans-serif" }}>
      <section style={{ borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <Link
            href={`/results?office=${candidate.officeId}`}
            style={{ color: "#1d4ed8", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}
          >
            ← Back to results
          </Link>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              gap: "1.5rem",
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <div style={{ maxWidth: 650 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8" }}>
                {office?.name ?? candidate.officeId}
              </p>

              <h1 style={{ marginTop: "0.5rem", fontSize: "2.5rem", fontWeight: 700 }}>
                {candidate.name}
              </h1>

              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    background: "#f5f5f5",
                    fontSize: "0.9rem",
                    color: "#555"
                  }}
                >
                  {candidate.party}
                </span>
                <span
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    background: "#fff",
                    fontSize: "0.9rem",
                    color: "#555"
                  }}
                >
                  {office?.level ?? "office"}
                </span>
              </div>

              <p style={{ marginTop: "1.25rem", color: "#444", lineHeight: 1.7 }}>
                {candidate.bio}
              </p>

             {"website" in candidate && typeof candidate.website === "string" && candidate.website ? (
  <a
    href={candidate.website}
    target="_blank"
    rel="noreferrer"
    style={{
      display: "inline-block",
      marginTop: "1.25rem",
      padding: "0.75rem 1rem",
      borderRadius: 10,
      border: "1px solid #ccc",
      background: "#fff",
      color: "#111",
      textDecoration: "none",
      fontWeight: 600
    }}
  >
    Visit campaign website
  </a>
) : null}
  >
    Visit campaign website
  </a>
) : null}
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: 280,
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                background: "#fff",
                padding: "1.25rem"
              }}
            >
              <p style={{ fontSize: "0.9rem", color: "#666" }}>Candidate ID</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.95rem", fontWeight: 700, wordBreak: "break-word" }}>
                {candidate.id}
              </p>

              <div
                style={{
                  marginTop: "1.25rem",
                  borderRadius: 12,
                  background: "#eff6ff",
                  padding: "1rem"
                }}
              >
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e40af" }}>
                  Demo note
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#1e3a8a", lineHeight: 1.6 }}>
                  This page is structured for sourced, issue-by-issue candidate comparisons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Position breakdown</h2>
          <p style={{ marginTop: "0.5rem", color: "#666", lineHeight: 1.6 }}>
            These are the questions currently mapped to this candidate for the {office?.name ?? candidate.officeId} quiz.
          </p>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          {candidateQuestions.map((question: any) => {
            const position = candidate.positions?.[question.id];
            const tone = stanceTone(position?.label);

            const weightedForOffice =
              (candidate.officeLevel === "state" && question.scope === "state") ||
              (candidate.officeLevel === "federal" && question.scope === "federal");

            return (
              <div
                key={question.id}
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
                    <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1d4ed8" }}>
                      {question.topic}
                    </p>

                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: 999,
                          border: "1px solid #ddd",
                          background: "#f5f5f5",
                          fontSize: "0.75rem",
                          color: "#555"
                        }}
                      >
                        Scope: {question.scope}
                      </span>

                      {weightedForOffice ? (
                        <span
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: 999,
                            border: "1px solid #bfdbfe",
                            background: "#eff6ff",
                            fontSize: "0.75rem",
                            color: "#1d4ed8",
                            fontWeight: 600
                          }}
                        >
                          Weighted 2x for this office
                        </span>
                      ) : null}
                    </div>

                    <h3 style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.6 }}>
                      {question.text}
                    </h3>
                  </div>

                  <div
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: 999,
                      border: `1px solid ${tone.border}`,
                      background: tone.bg,
                      color: tone.text,
                      fontWeight: 700,
                      fontSize: "0.9rem"
                    }}
                  >
                    {position?.label ?? "No stance"}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.25rem",
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
                  }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      background: "#f5f5f5",
                      padding: "1rem"
                    }}
                  >
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>Stored stance value</p>
                    <p style={{ marginTop: "0.5rem", fontSize: "1.4rem", fontWeight: 700 }}>
                      {position?.stance ?? "N/A"}
                    </p>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      background: "#f5f5f5",
                      padding: "1rem"
                    }}
                  >
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>Source</p>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.95rem", fontWeight: 700 }}>
                      {position?.sourceLabel ?? "No source available"}
                    </p>

                    {position?.sourceUrl ? (
                      <a
                        href={position.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "0.5rem",
                          color: "#1d4ed8",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textDecoration: "none"
                        }}
                      >
                        Open source →
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1.5rem 2rem" }}>
        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 16,
            background: "#fff",
            padding: "1.5rem"
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Promise tracker</h2>
          <p style={{ marginTop: "0.5rem", color: "#666", lineHeight: 1.6 }}>
            Placeholder for future tracking of promises, public actions, votes, and follow-through.
          </p>

          <div
            style={{
              marginTop: "1.25rem",
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
            }}
          >
            <TrackerCard
              title="Promises collected"
              value="0"
              note="To be added from campaign platforms"
            />
            <TrackerCard
              title="Tracked actions"
              value="0"
              note="Bills, statements, and executive actions"
            />
            <TrackerCard
              title="Status"
              value="Coming soon"
              note="This module can grow into accountability tracking"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function TrackerCard({
  title,
  value,
  note
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid #e5e5e5",
        background: "#f5f5f5",
        padding: "1rem"
      }}
    >
      <p style={{ fontSize: "0.9rem", color: "#666" }}>{title}</p>
      <p style={{ marginTop: "0.75rem", fontSize: "1.6rem", fontWeight: 700 }}>
        {value}
      </p>
      <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>
        {note}
      </p>
    </div>
  );
}
