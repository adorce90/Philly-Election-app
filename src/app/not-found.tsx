import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="container" style={{ padding: "4rem 0" }}>
        <div className="panel panel-lg">
          <span className="eyebrow">Not found</span>
          <h1 className="header-title">Page not found</h1>
          <p className="section-copy">
            The page you are looking for does not exist or may have moved.
          </p>

          <div className="spacer-top">
            <Link href="/" className="btn-secondary">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
