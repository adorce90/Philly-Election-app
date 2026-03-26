"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCandidatesByOffice,
  getOffices,
  getQuestionsByOffice
} from "../../lib/loadData";
import { loadQuizAnswers } from "../../lib/quizStorage";
import { rankCandidates } from "../../lib/match";

function ResultsPageInner() {
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
    <main className="page-shell results-shell">
      <section className="header-band">
        <div className="container">
          <span className="eyebrow">Results</span>
          <h1 className="header-title">Your candidate matches</h1>
          <p className="section-copy">
            Ranked by how closely each candidate aligns with your answers for{" "}
            {office?.name ?? officeId}. Office-relevant issues count more heavily.
          </p>

          <div className="chip-row">
            <Link href={`/quiz?office=${officeId}`}>
              <span className="btn-secondary">Retake quiz</span>
            </Link>
            <Link href="/">
              <span className="btn-secondary">Change office</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {results.length === 0 ? (
            <div className="panel panel-lg">No candidates found for this office.</div>
          ) : (
            <div className="results-list">
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
                  <div key={candidate.id} className="result-card">
                    <div className="result-top">
                      <div>
                        <div className="rank-badge">#{idx + 1} Match</div>
                        <h2 className="result-name">{candidate.name}</h2>
                        <div className="party-line">
                          {candidate.party} · {office?.name ?? candidate.officeId}
                        </div>
                        <p className="bio-copy">{candidate.bio}</p>
                      </div>

                      <div className="match-box">
                        <div className="match-label">Match</div>
                        <div className="match-value">{result.percentage}%</div>
                      </div>
                    </div>

                    <div className="metrics-grid">
                      <ScopeScoreCard title="State-power alignment" item={result.scopeBreakdown.state} />
                      <ScopeScoreCard title="Federal-power alignment" item={result.scopeBreakdown.federal} />
                      <ScopeScoreCard title="Shared/local issues" item={result.scopeBreakdown.local_shared} />
                    </div>

                    <div className="topic-grid">
                      <TopicCard
                        title="Top alignment areas"
                        items={agreementTopics}
                        emptyText="No exact agreement topics recorded yet."
                        tone="success"
                      />
                      <TopicCard
                        title="Biggest differences"
                        items={differenceTopics}
                        emptyText="No major differences recorded yet."
                        tone="danger"
                      />
                    </div>

                    <div className="spacer-top">
                      <Link href={`/candidate/${candidate.id}`}>
                        <span className="btn-secondary">View candidate</span>
                      </Link>
                    </div>
                  </div>
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
    <Suspense fallback={<main className="page-shell results-shell"><div className="container"><div className="panel panel-lg">Loading results...</div></div></main>}>
      <ResultsPageInner />
    </Suspense>
  );
}

function ScopeScoreCard({ title, item }: { title: string; item: any }) {
  const hasData = item.possible > 0;

  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{hasData ? `${item.percentage}%` : "—"}</div>
      <div className="muted" style={{ marginTop: "0.3rem", fontSize: "0.86rem" }}>
        {hasData
          ? `${item.earned} of ${item.possible} weighted points`
          : "No scored questions in this scope"}
      </div>
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
  tone: "success" | "danger";
}) {
  return (
    <div className={`topic-card ${tone}`}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p style={{ marginTop: "0.75rem" }}>{emptyText}</p>
      ) : (
        <ul className="topic-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
