import "./globals.css";

export const metadata = {
  title: "VoterAlign Philly 2026",
  description: "Find candidates who align with your values. A nonpartisan voter alignment tool for Philadelphia and Pennsylvania's 2026 elections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="site-nav">
          <div className="container site-nav-inner">
            <a href="/" className="site-nav-logo">
              <span className="site-nav-logo-star">✦</span>
              VoterAlign Philly
            </a>
            <nav className="site-nav-links">
              <a href="/" className="site-nav-link">Home</a>
              <a href="/topics" className="site-nav-link">Topics</a>
              <a href="/results" className="site-nav-link">Results</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
