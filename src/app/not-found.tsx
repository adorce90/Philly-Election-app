import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Page not found</h1>
      <p style={{ marginTop: "1rem" }}>
        The page you are looking for does not exist.
      </p>

      <Link href="/">
        <button
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          Go home
        </button>
      </Link>
    </main>
  );
}
