"use client";

import { useState } from "react";

interface ShareButtonProps {
  topMatches: { name: string; percentage: number; office: string }[];
  topics: string[];
}

export default function ShareButton({ topMatches, topics }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = typeof window !== "undefined" ? window.location.origin : "https://voterAlign.app";

  const topMatch = topMatches[0];
  const shareText = topMatch
    ? `I just found my 2026 Philadelphia ballot matches on VoterAlign! My top match is ${topMatch.name} at ${topMatch.percentage}% alignment on ${topics.slice(0, 2).join(" & ")}. Find yours 👇`
    : `I just found my 2026 Philadelphia ballot matches on VoterAlign! Find yours 👇`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "VoterAlign Philly 2026", text: shareText, url });
        setOpen(false);
      } catch (_) {}
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="btn"
        onClick={() => setOpen(o => !o)}
        style={{ gap: "0.5rem" }}
      >
        <span>↗</span> Share your results
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />

          {/* Dropdown */}
          <div style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: 0,
            zIndex: 50,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "var(--shadow-lg)",
            padding: "0.75rem",
            minWidth: 240,
            display: "grid",
            gap: "0.5rem"
          }}>
            {/* Match preview card inside dropdown */}
            {topMatch && (
              <div style={{
                padding: "0.85rem 1rem",
                borderRadius: 12,
                background: "var(--primary-soft)",
                border: "1px solid rgba(61,138,113,0.2)",
                marginBottom: "0.25rem"
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)", marginBottom: "0.3rem" }}>
                  Your top match
                </div>
                <div style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: "1rem", color: "var(--text)" }}>
                  {topMatch.name}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-soft)", marginTop: "0.15rem" }}>
                  {topMatch.percentage}% aligned · {topMatch.office}
                </div>
              </div>
            )}

            {/* Share options */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button onClick={handleNativeShare} style={shareOptionStyle}>
                <span>📱</span> Share via phone
              </button>
            )}

            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              style={{ ...shareOptionStyle, textDecoration: "none", display: "flex" }}
            >
              <span>𝕏</span> Post on X / Twitter
            </a>

            <button onClick={handleCopy} style={shareOptionStyle}>
              <span>{copied ? "✓" : "📋"}</span>
              {copied ? "Copied!" : "Copy link & message"}
            </button>

            <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "0.5rem", marginTop: "0.15rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5, padding: "0 0.25rem" }}>
                Sharing helps more Philly voters find candidates who match their values.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const shareOptionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  padding: "0.72rem 0.9rem",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--surface-muted)",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.9rem",
  color: "var(--text)",
  transition: "all 0.14s ease",
  width: "100%",
  textAlign: "left",
};
