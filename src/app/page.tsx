import Link from "next/link";
import { getElection, getOffices } from "../lib/loadData";

export default function HomePage() {
  const election = getElection();
  const offices = getOffices();

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div className="panel panel-lg">
            <span className="eyebrow">Philadelphia 2026 Demo</span>
            <h1 className="hero-title">{election.title}</h1>
            <p className="hero-copy">
              Answer a short issue-based assessment and see which candidates align
              most closely with your priorities. Questions tied to the actual
              power of each office count more heavily.
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
              <div className="stat-card">
                <div className="stat-label">Registration deadline</div>
                <div className="stat-value">{election.registrationDeadline}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Mail-in deadline</div>
                <div className="stat-value">{election.mailInDeadline}</div>
              </div>
            </div>
          </div>

          <div className="panel panel-lg">
            <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
              How matching works
            </h2>
            <p className="section-copy" style={{ marginTop: "0.8rem" }}>
              This tool compares your answers with candidate issue positions and
              weights questions more heavily when they match the real authority
              of the office you selected.
            </p>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Governor</div>
                <div className="stat-value">State issues weighted 2x</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">U.S. House</div>
                <div className="stat-value">Federal issues weighted 2x</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Polling hours</div>
                <div className="stat-value">{election.pollingHours}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Format</div>
                <div className="stat-value">Quiz → match → explain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Choose an office</h2>
          <p className="section-copy">
            Start with one office. Each path uses a tailored question set and
            match logic tied to the powers of that role.
          </p>

          <div className="card-grid">
            {offices.map((office: any) => (
              <Link key={office.id} href={`/quiz?office=${office.id}`} className="office-card">
                <span className="office-level">{office.level}</span>
                <h3 className="office-name">{office.name}</h3>
                <p className="office-copy">
                  Take the assessment for {office.name} and compare your priorities
                  against the candidates running for that office.
                </p>
                <div className="spacer-top">
                  <span className="btn">Start assessment</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
