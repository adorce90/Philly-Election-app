@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ─── Reset ── */
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: #f5f0e8;
  color: #1a1208;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font: inherit; }
h1,h2,h3,h4 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; letter-spacing: -.01em; }

/* ─── Tokens ── */
:root {
  --parchment:     #f5f0e8;
  --parchment-mid: #faf7f0;
  --parchment-dark:#ede4cc;
  --ink:           #1a1208;
  --ink-soft:      #2a1f0e;
  --ink-mid:       #5c4a2a;
  --ink-muted:     #8b7050;
  --gold:          #8b6914;
  --gold-light:    #c8a84a;
  --rule:          #c8b896;
  --rule-soft:     #d4c4a0;
  --dem-ink:       #1a3a6e;
  --dem-bg:        #e8eef8;
  --rep-ink:       #6e1a1a;
  --rep-bg:        #f8e8e8;
  --agree:         #1a4a28;
  --agree-bg:      #f0f7f2;
  --agree-rule:    #a8c8b0;
  --oppose:        #7a1e1e;
  --oppose-bg:     #f7f0f0;
  --oppose-rule:   #c8a8a8;
  --max:           1100px;
  --shadow:        4px 4px 0 rgba(26,18,8,.10);
}

/* ─── Container ── */
.container {
  width: min(var(--max), calc(100% - 2rem));
  margin: 0 auto;
}

/* ─── Site Nav ── */
.site-nav {
  background: var(--ink);
  border-bottom: 3px solid var(--gold);
  position: sticky;
  top: 0;
  z-index: 100;
}
.site-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  gap: 1rem;
}
.site-nav-logo {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 1.15rem;
  color: #e8d5a0;
  letter-spacing: .01em;
  display: flex;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
}
.site-nav-logo-star { color: var(--gold); font-size: 1rem; }
.site-nav-links { display: flex; align-items: center; gap: .15rem; }
.site-nav-link {
  font-family: 'DM Sans', sans-serif;
  font-size: .72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #a89060;
  padding: .38rem .8rem;
  border-radius: 2px;
  text-decoration: none;
  transition: color .15s, background .15s;
}
.site-nav-link:hover { color: #e8d5a0; background: rgba(139,105,20,.15); }
@media(max-width:500px){ .site-nav-links { display: none; } }

/* ─── Page shell ── */
.page-shell { min-height: 100vh; background: var(--parchment); }

/* ─── Masthead ── */
.bs-masthead {
  text-align: center;
  padding: 2rem 0 1.5rem;
  border-bottom: 3px double var(--ink);
  margin-bottom: 1.5rem;
  position: relative;
}
.bs-masthead-stars {
  font-size: .72rem;
  letter-spacing: .3em;
  color: var(--gold);
  margin-bottom: .5rem;
}
.bs-pub-date {
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--gold);
  margin-bottom: .75rem;
}
.bs-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 7vw, 4rem);
  font-weight: 900;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -.02em;
}
.bs-subtitle {
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: var(--ink-mid);
  margin-top: .4rem;
}
.bs-masthead-footer {
  font-family: 'DM Sans', sans-serif;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--gold);
  margin-top: .75rem;
  padding-top: .75rem;
  border-top: 1px solid var(--gold);
}

/* ─── Race header bar ── */
.bs-race-header {
  background: var(--ink);
  color: #e8d5a0;
  padding: .6rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.bs-race-title {
  font-family: 'Playfair Display', serif;
  font-size: .97rem;
  font-weight: 700;
  letter-spacing: .02em;
}
.bs-race-meta {
  font-family: 'DM Sans', sans-serif;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: #a89060;
}

/* ─── Card / panel ── */
.bs-card {
  background: var(--parchment-mid);
  border: 1px solid var(--rule);
  border-top: none;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
.bs-section { padding: 2rem 0 3rem; }

/* ─── Two-column grid ── */
.bs-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 0;
}
.bs-col-rule {
  background: repeating-linear-gradient(
    to bottom, var(--ink) 0, var(--ink) 4px, transparent 4px, transparent 8px
  );
}
.bs-col { padding: 0 1.25rem; }
.bs-col:first-child { padding-left: 0; }
.bs-col:last-child  { padding-right: 0; }

/* ─── Best match banner ── */
.bs-best-banner {
  background: var(--ink);
  color: #e8d5a0;
  padding: .26rem .68rem;
  font-family: 'DM Sans', sans-serif;
  font-size: .6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  display: inline-flex;
  margin-bottom: .5rem;
}

/* ─── Candidate name in results cards ── */
.bs-cand-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: .5rem;
  flex-wrap: wrap;
  margin-bottom: .3rem;
}
.bs-cand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
}
.bs-score {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 900;
}
.bs-score.high { color: var(--agree); }
.bs-score.low  { color: var(--oppose); }
.bs-score-lbl {
  font-family: 'DM Sans', sans-serif;
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--gold);
  margin-left: .15rem;
}

/* ─── Byline ── */
.bs-byline {
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--gold);
  margin-bottom: .65rem;
  display: flex;
  align-items: center;
  gap: .4rem;
  flex-wrap: wrap;
}
.bs-party-dem { color: var(--dem-ink); font-weight: 700; }
.bs-party-rep { color: var(--rep-ink); font-weight: 700; }

/* ─── Body copy ── */
.bs-body {
  font-family: 'EB Garamond', serif;
  font-size: .97rem;
  color: var(--ink-soft);
  line-height: 1.75;
  margin-bottom: .75rem;
}
.bs-body.dropcap::first-letter {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 900;
  float: left;
  line-height: .8;
  margin: 0 .12rem -.2rem 0;
  color: var(--ink);
}

/* ─── Issue table ── */
.bs-issue-table {
  width: 100%;
  border-collapse: collapse;
  margin: .65rem 0;
  font-size: .85rem;
}
.bs-issue-table tr { border-bottom: 1px solid var(--rule-soft); }
.bs-issue-table tr:last-child { border-bottom: none; }
.bs-issue-table td {
  padding: .32rem .05rem;
  font-family: 'EB Garamond', serif;
  vertical-align: middle;
}
.bs-issue-table td:last-child {
  text-align: right;
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  white-space: nowrap;
}
.td-agree   { color: var(--agree); }
.td-oppose  { color: var(--oppose); }
.td-neutral { color: var(--gold); }

/* ─── Read more link ── */
.bs-read-more {
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--gold);
  border-bottom: 1px solid var(--gold);
  cursor: pointer;
  display: inline-block;
  margin-top: .25rem;
}

/* ─── Section divider ornament ── */
.bs-ornament {
  text-align: center;
  color: var(--gold);
  font-size: .85rem;
  letter-spacing: .3em;
  margin: 1rem 0;
}

/* ─── Chip row (topics) ── */
.bs-chip-row {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: .75rem;
}
.bs-chip {
  font-family: 'DM Sans', sans-serif;
  font-size: .7rem;
  font-weight: 600;
  padding: .25rem .65rem;
  border: 1px solid var(--rule);
  background: var(--parchment-mid);
  color: var(--ink);
}
.bs-action-link {
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--gold);
  background: none;
  border: 1px solid var(--gold);
  padding: .32rem .75rem;
  cursor: pointer;
}

/* ─── Buttons ── */
.btn-bs {
  background: var(--ink);
  color: #e8d5a0;
  border: none;
  padding: .65rem 1.4rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  transition: opacity .15s;
}
.btn-bs:hover { opacity: .85; }
.btn-bs:disabled { opacity: .35; cursor: not-allowed; }
.btn-bs-outline {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--rule);
  padding: .55rem 1.1rem;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .09em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  transition: border-color .15s, background .15s;
}
.btn-bs-outline:hover { border-color: var(--gold); background: rgba(139,105,20,.04); }

/* ─── ZIP input ── */
.bs-input-wrap {
  border: 1px solid var(--ink);
  padding: 1rem;
  margin-bottom: 1.25rem;
  background: var(--parchment-mid);
}
.bs-input-label {
  font-family: 'DM Sans', sans-serif;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--gold);
  display: block;
  margin-bottom: .4rem;
}
.bs-input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--ink);
  outline: none;
  border-bottom: 1.5px solid var(--ink);
  padding: .2rem 0;
}
.bs-input::placeholder { color: var(--rule); font-style: italic; }

/* ─── How it works (home) ── */
.bs-how-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 0;
  border: 1px solid var(--rule);
  background: var(--parchment-mid);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
.bs-how-step {
  display: flex;
  gap: .65rem;
  align-items: baseline;
  padding: .5rem 0;
  border-bottom: 1px dotted var(--rule);
}
.bs-how-step:last-child { border-bottom: none; }
.bs-how-num {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gold);
  flex-shrink: 0;
  width: 1.5rem;
}
.bs-how-title {
  font-family: 'Playfair Display', serif;
  font-size: .97rem;
  font-weight: 700;
  color: var(--ink);
}
.bs-how-desc {
  font-family: 'EB Garamond', serif;
  font-size: .88rem;
  color: var(--ink-mid);
  font-style: italic;
  margin-top: .1rem;
}
.bs-election-table {
  display: grid;
  gap: .4rem;
}
.bs-election-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dotted var(--rule);
  padding-bottom: .35rem;
  font-size: .9rem;
}
.bs-election-row:last-child { border-bottom: none; }
.bs-election-label { font-family: 'EB Garamond', serif; color: var(--ink-soft); }
.bs-election-value { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--ink); }

/* ─── Info box (nonpartisan disclaimer) ── */
.bs-info-box {
  padding: .75rem;
  border: 1px solid var(--rule);
  background: var(--parchment);
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: .88rem;
  color: var(--ink-mid);
  line-height: 1.65;
  margin-top: 1rem;
}

/* ─── Topics page ── */
.bs-topic-section-head {
  border-top: 3px solid var(--ink);
  border-bottom: 1px solid var(--ink);
  padding: .4rem 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: baseline;
  gap: .75rem;
}
.bs-topic-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--ink);
  white-space: nowrap;
}
.bs-topic-rule { flex: 1; height: 0; border-top: 1px solid var(--ink); }

.bs-topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: .65rem;
  margin-bottom: 1rem;
}
.bs-topic-tile {
  padding: .9rem .75rem;
  border: 1.5px solid var(--rule);
  background: var(--parchment-mid);
  text-align: center;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.bs-topic-tile:hover { border-color: var(--gold); background: var(--parchment); }
.bs-topic-tile.sel {
  border: 2px solid var(--ink);
  background: var(--parchment-dark);
}
.bs-topic-tile.dim { opacity: .38; cursor: not-allowed; }
.bs-topic-emoji { font-size: 1.3rem; margin-bottom: .3rem; }
.bs-topic-name {
  font-family: 'Playfair Display', serif;
  font-size: .88rem;
  font-weight: 700;
  color: var(--ink);
}
.bs-topic-desc {
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: .75rem;
  color: var(--ink-muted);
  margin-top: .15rem;
  line-height: 1.4;
}

/* ─── Quiz page ── */
.bs-progress-wrap { margin-bottom: 1.25rem; }
.bs-progress-meta {
  display: flex;
  justify-content: space-between;
  font-family: 'DM Sans', sans-serif;
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--gold);
  margin-bottom: .4rem;
}
.bs-progress-track {
  height: 3px;
  background: var(--rule);
  position: relative;
}
.bs-progress-fill {
  height: 100%;
  background: var(--ink);
  transition: width .4s ease;
}

.bs-quiz-card {
  border: 1px solid var(--ink);
  background: var(--parchment-mid);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  position: relative;
}
.bs-quiz-topic {
  font-family: 'DM Sans', sans-serif;
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--gold);
  margin-bottom: .5rem;
}
.bs-quiz-q {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.1rem, 2.5vw, 1.45rem);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.45;
  margin-bottom: .75rem;
}
.bs-quiz-why {
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: .9rem;
  color: var(--ink-mid);
  border-left: 2px solid var(--gold);
  padding-left: .75rem;
  margin-bottom: 1rem;
  line-height: 1.65;
}
.bs-quiz-options {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
}
.bs-quiz-option {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .6rem 1rem;
  border: 1.5px solid var(--rule);
  background: var(--parchment);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: .82rem;
  color: var(--ink);
  transition: border-color .14s, background .14s;
}
.bs-quiz-option:hover:not(:disabled) { border-color: var(--gold); }
.bs-quiz-option.sel { border: 2px solid var(--ink); background: var(--parchment-dark); }
.bs-quiz-option.faded { opacity: .35; }

/* ─── Candidate detail ── */
.bs-detail-shell {
  background: var(--parchment-mid);
  border: 2px solid var(--ink);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}
.bs-detail-topbar {
  background: var(--ink);
  padding: .7rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
}
.bs-detail-topbar-label {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: .97rem;
  color: #e8d5a0;
}
.bs-detail-topbar-meta {
  font-family: 'DM Sans', sans-serif;
  font-size: .6rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: #a89060;
}
.bs-detail-body { padding: 1.5rem; }
.bs-detail-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: start;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid var(--ink);
  margin-bottom: 1.25rem;
}

/* ✅ Clean upright candidate name — DM Sans not italic Playfair */
.bs-detail-cand-name {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.15;
  letter-spacing: -.02em;
  margin: .3rem 0 0;
}
.bs-detail-kicker {
  font-family: 'DM Sans', sans-serif;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--gold);
  margin-bottom: .2rem;
}
.bs-detail-office {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  color: var(--ink-mid);
  font-style: italic;
  margin-top: .2rem;
}
.bs-detail-party-dem {
  display: inline-flex;
  font-family: 'DM Sans', sans-serif;
  font-size: .65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--dem-ink);
  background: var(--dem-bg);
  padding: .18rem .55rem;
  margin-top: .4rem;
}
.bs-detail-party-rep {
  display: inline-flex;
  font-family: 'DM Sans', sans-serif;
  font-size: .65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--rep-ink);
  background: var(--rep-bg);
  padding: .18rem .55rem;
  margin-top: .4rem;
}
.bs-detail-bio {
  font-family: 'EB Garamond', serif;
  font-size: .97rem;
  color: var(--ink-soft);
  line-height: 1.78;
  margin-top: .85rem;
  max-width: 500px;
}
.bs-detail-score-box {
  text-align: right;
  border-left: 1px solid var(--rule);
  padding-left: 1.25rem;
  min-width: 130px;
}
.bs-detail-score-label {
  font-family: 'DM Sans', sans-serif;
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--gold);
  margin-bottom: .3rem;
}
.bs-detail-score-num {
  font-family: 'Playfair Display', serif;
  font-size: 3.2rem;
  font-weight: 900;
  color: var(--agree);
  line-height: 1;
}
.bs-detail-score-sub {
  font-family: 'EB Garamond', serif;
  font-size: .82rem;
  color: var(--gold);
  font-style: italic;
  margin-top: .25rem;
}

/* Stats row */
.bs-detail-stats {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: .65rem;
  margin-bottom: 1.25rem;
}
.bs-stat-box {
  border: 1px solid var(--rule);
  padding: .75rem;
  text-align: center;
  background: var(--parchment);
}
.bs-stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
}
.bs-stat-lbl {
  font-family: 'DM Sans', sans-serif;
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--gold);
  margin-top: .15rem;
}

/* Issue record table */
.bs-issue-section-title {
  font-family: 'DM Sans', sans-serif;
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--gold);
  padding-bottom: .5rem;
  border-bottom: 2px solid var(--ink);
  margin-bottom: .75rem;
}
.bs-issue-row {
  display: grid;
  grid-template-columns: 1.4rem 1fr auto;
  gap: .5rem;
  align-items: baseline;
  padding: .42rem 0;
  border-bottom: 1px solid var(--rule-soft);
}
.bs-issue-row:last-child { border-bottom: none; }
.bs-issue-icon { font-size: .88rem; text-align: center; }
.bs-issue-q {
  font-family: 'EB Garamond', serif;
  color: var(--ink-soft);
  line-height: 1.45;
  font-size: .95rem;
}
.bs-issue-source {
  font-size: .75rem;
  color: var(--gold);
  font-style: italic;
  margin-top: .1rem;
}
.bs-verdict {
  font-family: 'DM Sans', sans-serif;
  font-size: .65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  white-space: nowrap;
}
.bs-verdict.agree  { color: var(--agree); }
.bs-verdict.oppose { color: var(--oppose); }
.bs-verdict.neutral{ color: var(--gold); }

/* Record footer */
.bs-record-footer {
  padding-top: .85rem;
  margin-top: .5rem;
  border-top: 2px solid var(--ink);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: .5rem;
}
.bs-record-footer-note {
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: .85rem;
  color: var(--gold);
}
.bs-record-tally {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--agree);
}

/* Coming soon */
.bs-coming-soon {
  border: 1px dashed var(--rule);
  padding: 1.25rem;
  text-align: center;
  margin-top: 1.25rem;
  background: rgba(139,105,20,.02);
}

/* ─── Responsive ── */
@media(max-width:700px){
  .bs-grid, .bs-how-grid { grid-template-columns: 1fr; }
  .bs-col-rule { display: none; }
  .bs-col { padding: 0; margin-bottom: 1.25rem; }
  .bs-col:last-child { margin-bottom: 0; }
  .bs-detail-hero { grid-template-columns: 1fr; }
  .bs-detail-score-box { border-left: none; border-top: 1px solid var(--rule); padding-left: 0; padding-top: 1rem; }
  .bs-quiz-options { flex-direction: column; }
  .bs-quiz-option { justify-content: center; }
  .bs-how-grid { padding: 1rem; }
}
