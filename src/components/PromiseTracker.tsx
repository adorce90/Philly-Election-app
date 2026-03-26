type PromiseItem = {
  id: string;
  title: string;
  summary: string;
  sourceLabel: string;
  status: string;
  lastUpdated: string;
};

export default function PromiseTracker({
  promises
}: {
  promises: PromiseItem[];
}) {
  if (!promises || promises.length === 0) {
    return (
      <div className="panel panel-lg spacer-top" style={{ marginTop: "2rem" }}>
        <h2 className="section-title" style={{ fontSize: "1.4rem" }}>
          Promise Tracker
        </h2>
        <p className="section-copy">
          No tracked commitments available yet for this candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="panel panel-lg spacer-top" style={{ marginTop: "2rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.4rem" }}>
        Promise Tracker
      </h2>
      <p className="section-copy">
        Public commitments and issue promises currently tracked for this candidate.
      </p>

      <div className="tracker-grid spacer-top">
        {promises.map((promise) => (
          <div key={promise.id} className="tracker-card">
            <div className="detail-kicker">Commitment</div>
            <div className="metric-value" style={{ fontSize: "1.15rem" }}>
              {promise.title}
            </div>

            <p className="section-copy" style={{ marginTop: "0.5rem" }}>
              {promise.summary}
            </p>

            <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.4rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
                <strong>Status:</strong> {promise.status}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
                <strong>Source:</strong> {promise.sourceLabel}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                Last updated: {promise.lastUpdated}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
