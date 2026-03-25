import { getElection, getOffices } from "../lib/loadData";

export default function HomePage() {
  const election = getElection();
  const offices = getOffices();

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        {election.title}
      </h1>

      <p style={{ marginTop: "0.5rem", color: "#555" }}>
        {election.location}
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <p><strong>Election Date:</strong> {election.date}</p>
        <p><strong>Registration Deadline:</strong> {election.registrationDeadline}</p>
        <p><strong>Mail-in Deadline:</strong> {election.mailInDeadline}</p>
        <p><strong>Polling Hours:</strong> {election.pollingHours}</p>
      </div>

      <h2 style={{ marginTop: "2rem", fontSize: "1.5rem" }}>
        Choose an Office
      </h2>

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        {offices.map((office) => (
          <Link key={office.id} href={`/quiz?office=${office.id}`}>
            <button
              style={{
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer"
              }}
            >
              {office.name}
            </button>
          </Link>
        ))}
      </div>
    </main>
  );
}
