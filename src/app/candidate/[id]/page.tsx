import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCandidateById,
  getOffices,
  getPromisesByCandidateId,
  getQuestionsByOffice
} from "../../../lib/loadData";
import PromiseTracker from "../../../components/PromiseTracker";

function stanceClass(label?: string) {
  switch (label) {
    case "Support":
      return "stance-pill support";
    case "Oppose":
      return "stance-pill oppose";
    default:
      return "stance-pill neutral";
  }
}

function confidenceTone(confidence?: string) {
  switch (confidence) {
    case "high":
      return {
        bg: "#ecfdf5",
        border: "#a7f3d0",
        text: "#065f46"
      };
    case "medium":
      return {
        bg: "#fffbeb",
        border: "#fde68a",
        text: "#92400e"
      };
    default:
      return {
        bg: "#f8fafc",
        border: "#dbe3ef",
        text: "#475569"
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
  const promises = getPromisesByCandidateId(candidate.id);

  const candidateQuestions = questions.filter(
    (question: any) => candidate.positions?.[question.id]
  );

  return (
    <main className="page-shell detail-shell">
      <section className="header-band">
        <div className="container">
          <Link
            href={`/results?office=${candidate.officeId}`}
            style={{ color: "#1d4ed8", fontWeight: 700 }}
          >
            ← Back to results
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-top">
            <div className="panel panel-lg">
              <span className="eyebrow">{office?.name ?? candidate.officeId}</span>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    border: "1px solid #dbe3ef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "#374151"
                  }}
                >
                  {candidate.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h1 className="header-title" style={{ margin: 0 }}>
                    {candidate.name}
                  </h1>

                  <div className="chip-row" style={{ marginTop: "0.75rem" }}>
                    <span className="chip">{candidate.party}</span>
                    <span className="chip">{office?.level ?? "office"}</span>
                  </div>
                </div>
              </div>

              <p className="section-copy" style={{ marginTop: "1rem" }}>
                {candidate.bio}
              </p>

              {"website" in candidate &&
              typeof candidate.website === "string" &&
              candidate.website ? (
                <div className="spacer-top">
                  <a
                    href={candidate.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    Visit campaign website
                  </a>
                </div>
              ) : null}
            </div>

            <div className="panel panel-lg">
              <div className="detail-kicker">Candidate ID</div>
              <div className="metric-value" style={{ fontSize: "1.05rem", marginTop: "0.6rem" }}>
                {candidate.id}
              </div>

              <div className="detail-card spacer-top">
                <div className="detail-kicker">Demo note</div>
                <p className="section-copy" style={{ marginTop: "0.5rem" }}>
                  This page is designed for sourced, issue-by-issue candidate comparisons
                  and future accountability tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="spacer-top" style={{ marginTop: "2rem" }}>
            <h2 className="section-title">Position breakdown</h2>
            <p className="section-copy">
              These are the quiz questions currently mapped to this candidate.
            </p>
          </div>

          <div className="position-list spacer-top">
            {candidateQuestions.map((question: any) => {
              const position = candidate.positions?.[question.id];
              const confidenceStyle = confidenceTone(
                "confidence" in position ? position.confidence : undefined
              );

              const weightedForOffice =
                (candidate.officeLevel === "state" && question.scope === "state") ||
                (candidate.officeLevel === "federal" && question.scope === "federal");

              return (
                <div key={question.id} className="position-card">
                  <div className="position-head">
                    <div>
                      <div className="topic-label">{question.topic}</div>
                      <div className="chip-row">
                        <span className="chip">Scope: {question.scope}</span>
                        {weightedForOffice ? (
                          <span
                            className="chip"
                            style={{
                              color: "#1d4ed8",
                              background: "#eff6ff",
                              borderColor: "#bfdbfe"
                            }}
                          >
                            Weighted 2x for this office
                          </span>
                        ) : null}
                      </div>
                      <h3 className="position-title">{question.text}</h3>
                    </div>

                    <div className={stanceClass(position?.label)}>
                      {position?.label ?? "No stance"}
                    </div>
                  </div>

                  <div className="tracker-grid spacer-top">
                    <div className="detail-card">
                      <div className="detail-kicker">Stored stance value</div>
                      <div className="metric-value">{position?.stance ?? "N/A"}</div>
                    </div>

                    <div className="detail-card">
                      <div className="detail-kicker">Source</div>
                      <div style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                        {"sourceLabel" in position && typeof position.sourceLabel === "string"
                          ? position.sourceLabel
                          : "No source available"}
                      </div>

                      {"sourceUrl" in position &&
                      typeof position.sourceUrl === "string" &&
                      position.sourceUrl ? (
                        <div style={{ marginTop: "0.65rem" }}>
                          <a
                            href={position.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#1d4ed8", fontWeight: 700 }}
                          >
                            Open source →
                          </a>
                        </div>
                      ) : null}

                      {"confidence" in position &&
                      typeof position.confidence === "string" ? (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.35rem 0.7rem",
                            borderRadius: 999,
                            border: `1px solid ${confidenceStyle.border}`,
                            background: confidenceStyle.bg,
                            color: confidenceStyle.text,
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            textTransform: "capitalize"
                          }}
                        >
                          Confidence: {position.confidence}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {"quote" in position &&
                  typeof position.quote === "string" &&
                  position.quote ? (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #dbe3ef",
                        color: "#475569",
                        fontStyle: "italic",
                        lineHeight: 1.7
                      }}
                    >
                      “{position.quote}”
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <PromiseTracker promises={promises} />
        </div>
      </section>
    </main>
  );
}
