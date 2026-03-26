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
            <span className="eyebrow">Philadelphia 2026</span>
            <h1 className="hero-title">Philly 2026: Your City, Your Choice.</h1>
            <p className="hero-copy">
              Matching you with candidates for Governor, U.S. House District 2,
              and U.S. House District 3.
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
              How it works
            </h2>

            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div className="stat-card">
                <div className="stat-label">1. Find Your District</div>
                <div className="stat-value">
                  Select your office—we now cover the full Northeast, River Wards,
                  and West Philly areas.
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">2. Take the Assessment</div>
                <div className="stat-value">
                  Answer localized questions on the 2026 budget, SEPTA, and federal equity.
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">3. Get Your Match</div>
                <div className="stat-value">
                  Discover which candidate actually aligns with your life in Philadelphia.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Choose an office</h2>
          <p className="section-copy">
            Start with one office. Each assessment uses a question set tailored to
            that office’s actual role and power.
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
