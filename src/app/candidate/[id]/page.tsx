import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCandidateById,
  getOffices,
  getQuestionsByOffice
} from "../../../lib/loadData";

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
              <h1 className="header-title" style={{ marginTop: "1rem" }}>
                {candidate.name}
              </h1>

              <div className="chip-row">
                <span className="chip">{candidate.party}</span>
                <span className="chip">{office?.level ?? "office"}</span>
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
                          <span className="chip" style={{ color: "#1d4ed8", background: "#eff6ff", borderColor: "#bfdbfe" }}>
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
                      <div className="spacer-top" style={{ marginTop: "0.5rem", fontWeight: 700 }}>
                        {"sourceLabel" in position && typeof position.sourceLabel === "string"
                          ? position.sourceLabel
                          : "No source available"}
                      </div>

                      {"sourceUrl" in position &&
                      typeof position.sourceUrl === "string" &&
                      position.sourceUrl ? (
                        <div className="spacer-top" style={{ marginTop: "0.65rem" }}>
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel panel-lg spacer-top" style={{ marginTop: "2rem" }}>
            <h2 className="section-title" style={{ fontSize: "1.4rem" }}>Promise tracker</h2>
            <p className="section-copy">
              Placeholder for future tracking of promises, public actions, votes, and follow-through.
            </p>

            <div className="tracker-grid spacer-top">
              <TrackerCard title="Promises collected" value="0" note="To be added from campaign platforms" />
              <TrackerCard title="Tracked actions" value="0" note="Bills, statements, and executive actions" />
              <TrackerCard title="Status" value="Coming soon" note="This module can grow into accountability tracking" />
            </div>
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
    <div className="tracker-card">
      <div className="detail-kicker">{title}</div>
      <div className="metric-value">{value}</div>
      <p className="section-copy" style={{ marginTop: "0.5rem" }}>
        {note}
      </p>
    </div>
  );
}
