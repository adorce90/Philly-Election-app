"use client";

import { useState, useRef, useEffect } from "react";

interface ShareButtonProps {
  topMatches: { name: string; percentage: number; office: string }[];
  topics: string[];
}

export default function ShareButton({ topMatches, topics }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const url = typeof window !== "undefined" ? window.location.origin : "https://voteralign.app";

  const topMatch = topMatches[0];
  const shareText = topMatch
    ? `I just found my 2026 Philadelphia ballot matches on VoterAlign! My top match is ${topMatch.name} at ${topMatch.percentage}% alignment on ${topics.slice(0, 2).join(" & ")}. Find yours 👇`
    : `I just found my 2026 Philadelphia ballot matches on VoterAlign! Find yours 👇`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;

  // Calculate position when opening so dropdown is always fully visible
  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > dropdownHeight
        ? rect.bottom + 8
        : rect.top - dropdownHeight - 8;
      const left = Math.min(rect.left, window.innerWidth - 260);
      setDropdownPos({ top, left });
    }
    setOpen(o => !o);
  }

  // Close on scroll so it doesn't float away from button
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

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
      setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
    } catch (_) {}
  }

  return (
    <>
      <button
        ref={btnRef}
        className="btn"
        onClick={handleOpen}
        style={{ gap: "0.5rem" }}
      >
        <span>↗</span> Share your results
      </button>

      {open && (
        <>
          {/* Full-screen backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(0,0,0,0.15)",
              backdropFilter: "blur(2px)"
            }}
          />

          {/* Dropdown — fixed so it floats above EVERYTHING */}
          <div
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 18,
              boxShadow: "0 20px 60px rgba(24,55,38,0.18)",
              padding: "0.85rem",
              width: 260,
              display: "grid",
              gap: "0.5rem",
              animation: "shareIn 0.2s ease both"
            }}
          >
            {/* Top match preview */}
            {topMatch && (
              <div style={{
                padding: "0.85rem 1rem",
                borderRadius: 12,
                background: "var(--primary-soft)",
                border: "1px solid rgba(61,138,113,0.2)",
              }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)", marginBottom: "0.35rem" }}>
                  Your top match
                </div>
                <div style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: "0.97rem", color: "var(--text)" }}>
                  {topMatch.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginTop: "0.2rem" }}>
                  {topMatch.percentage}% aligned · {topMatch.office}
                </div>
              </div>
            )}

            <div style={{ height: 1, background: "var(--border-soft)", margin: "0.1rem 0" }} />

            {/* Native share — mobile only */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button onClick={handleNativeShare} style={optStyle}>
                <span>📱</span> Share via phone
              </button>
            )}

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              style={{ ...optStyle, textDecoration: "none", display: "flex" }}
            >
              <span style={{ fontWeight: 900, fontSize: "0.95rem" }}>𝕏</span>
              Post on X / Twitter
            </a>

            {/* Copy */}
            <button onClick={handleCopy} style={{
              ...optStyle,
              ...(copied ? { background: "var(--primary-soft)", borderColor: "var(--primary)", color: "var(--primary-dark)" } : {})
            }}>
              <span>{copied ? "✓" : "📋"}</span>
              {copied ? "Copied to clipboard!" : "Copy link & message"}
            </button>

            <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", lineHeight: 1.55, padding: "0.1rem 0.25rem" }}>
              Sharing helps more Philly voters find candidates who match their values.
            </div>
          </div>

          <style>{`
            @keyframes shareIn {
              from { opacity: 0; transform: translateY(6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </>
      )}
    </>
  );
}

const optStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  padding: "0.7rem 0.9rem",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "var(--surface-muted)",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.88rem",
  color: "var(--text)",
  transition: "all 0.14s ease",
  width: "100%",
  textAlign: "left",
};
