"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getElection, getOfficesForZip } from "../lib/loadData";
import { clearQuizAnswers, saveMatchedOffices, saveSelectedTopics, saveSelectedZip } from "../lib/quizStorage";

// ── Language definitions ──────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "es", label: "Español",  flag: "🇲🇽" },
  { code: "zh", label: "中文",     flag: "🇨🇳" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const T: Record<string, Record<string, string>> = {
  en: {
    welcome:       "Welcome to VoterAlign Philly. 👋",
    welcome_sub:   "I'll help you find 2026 candidates who match your values — no spin, no party push. Just alignment.",
    ask_zip:       "To get started, what's your Philadelphia ZIP code?",
    zip_found:     "Found it — ZIP {zip}. You have {n} races on your ballot:",
    zip_next:      "Next, I'll ask which issues matter most to you.",
    continue_btn:  "Pick my issues →",
    zip_error:     "That doesn't look like a Philadelphia ZIP. Try something like 19103, 19143, or 19120.",
    zip_invalid:   "Please enter a valid 5-digit ZIP code.",
    zip_placeholder: "Enter your ZIP code (e.g. 19103)",
    send:          "Send",
    choose_lang:   "Choose your language to get started:",
    split_prompt:  "Your ZIP crosses two state districts. Which neighborhood are you in?",
    how_title:     "How it works",
    step1:         "Enter your ZIP — we find your exact ballot",
    step2:         "Pick your issues — transit, housing, education & more",
    step3:         "Answer plain questions — takes about 2 minutes",
    step4:         "See your matches — ranked by alignment, not party",
    election_title:"Election Information",
    primary_date:  "Primary Election Date",
    register_by:   "Voter Registration Deadline",
    mailin_by:     "Mail-In Ballot Deadline",
    polling:       "Polling Hours",
    nonpartisan:   "This tool is nonpartisan. No candidate or party has paid for placement. All positions are sourced from public records and campaign statements.",
  },
  es: {
    welcome:       "Bienvenido a VoterAlign Philly. 👋",
    welcome_sub:   "Te ayudaré a encontrar candidatos del 2026 que compartan tus valores — sin sesgos, sin presión de partidos. Solo alineación.",
    ask_zip:       "Para comenzar, ¿cuál es tu código postal de Filadelfia?",
    zip_found:     "Encontrado — ZIP {zip}. Tienes {n} carreras en tu boleta:",
    zip_next:      "A continuación, te preguntaré qué temas te importan más.",
    continue_btn:  "Elegir mis temas →",
    zip_error:     "Ese no parece ser un código postal de Filadelfia. Prueba algo como 19103, 19143 o 19120.",
    zip_invalid:   "Por favor ingresa un código postal válido de 5 dígitos.",
    zip_placeholder: "Ingresa tu código postal (ej. 19103)",
    send:          "Enviar",
    choose_lang:   "Elige tu idioma para comenzar:",
    split_prompt:  "Tu código postal abarca dos distritos estatales. ¿En qué vecindario estás?",
    how_title:     "Cómo funciona",
    step1:         "Ingresa tu ZIP — encontramos tu boleta exacta",
    step2:         "Elige tus temas — transporte, vivienda, educación y más",
    step3:         "Responde preguntas simples — toma unos 2 minutos",
    step4:         "Ve tus coincidencias — ordenadas por alineación, no por partido",
    election_title:"Información Electoral",
    primary_date:  "Fecha de Elección Primaria",
    register_by:   "Fecha Límite de Registro",
    mailin_by:     "Fecha Límite de Voto por Correo",
    polling:       "Horario de Votación",
    nonpartisan:   "Esta herramienta es no partidista. Ningún candidato o partido ha pagado por su inclusión. Todas las posiciones provienen de registros públicos y declaraciones de campaña.",
  },
  zh: {
    welcome:       "欢迎来到 VoterAlign Philly。👋",
    welcome_sub:   "我将帮助您找到与您价值观相符的2026年候选人——无偏见，不推崇任何政党，只看立场匹配度。",
    ask_zip:       "请输入您的费城邮政编码以开始：",
    zip_found:     "已找到 — 邮编 {zip}。您的选票上有 {n} 个选举项目：",
    zip_next:      "接下来，我会询问哪些议题对您最重要。",
    continue_btn:  "选择我的议题 →",
    zip_error:     "这似乎不是费城的邮政编码。请尝试 19103、19143 或 19120 等邮编。",
    zip_invalid:   "请输入有效的5位邮政编码。",
    zip_placeholder: "输入邮政编码（例如 19103）",
    send:          "发送",
    choose_lang:   "请选择您的语言：",
    split_prompt:  "您的邮编跨越两个州选区。您在哪个街区？",
    how_title:     "使用方法",
    step1:         "输入邮编 — 我们找到您的确切选票",
    step2:         "选择议题 — 交通、住房、教育等",
    step3:         "回答简单问题 — 约需2分钟",
    step4:         "查看您的匹配结果 — 按立场排名，而非政党",
    election_title:"选举信息",
    primary_date:  "初选日期",
    register_by:   "选民登记截止日期",
    mailin_by:     "邮寄选票截止日期",
    polling:       "投票时间",
    nonpartisan:   "本工具不偏向任何党派。没有任何候选人或政党为此付费。所有立场均来自公开记录和竞选声明。",
  },
  vi: {
    welcome:       "Chào mừng đến với VoterAlign Philly. 👋",
    welcome_sub:   "Tôi sẽ giúp bạn tìm các ứng cử viên năm 2026 phù hợp với giá trị của bạn — không thiên vị, không ép buộc đảng phái. Chỉ là sự phù hợp.",
    ask_zip:       "Để bắt đầu, mã bưu chính Philadelphia của bạn là gì?",
    zip_found:     "Đã tìm thấy — Mã ZIP {zip}. Bạn có {n} cuộc đua trên lá phiếu của mình:",
    zip_next:      "Tiếp theo, tôi sẽ hỏi những vấn đề nào quan trọng nhất với bạn.",
    continue_btn:  "Chọn các vấn đề của tôi →",
    zip_error:     "Đây có vẻ không phải là mã bưu chính Philadelphia. Thử các mã như 19103, 19143 hoặc 19120.",
    zip_invalid:   "Vui lòng nhập mã bưu chính hợp lệ gồm 5 chữ số.",
    zip_placeholder: "Nhập mã bưu chính (vd. 19103)",
    send:          "Gửi",
    choose_lang:   "Chọn ngôn ngữ của bạn để bắt đầu:",
    split_prompt:  "Mã ZIP của bạn nằm ở hai khu vực tiểu bang. Bạn ở khu phố nào?",
    how_title:     "Cách hoạt động",
    step1:         "Nhập mã ZIP — chúng tôi tìm lá phiếu chính xác của bạn",
    step2:         "Chọn vấn đề — giao thông, nhà ở, giáo dục & nhiều hơn",
    step3:         "Trả lời câu hỏi đơn giản — mất khoảng 2 phút",
    step4:         "Xem kết quả phù hợp — xếp hạng theo quan điểm, không theo đảng",
    election_title:"Thông Tin Bầu Cử",
    primary_date:  "Ngày Bầu Cử Sơ Bộ",
    register_by:   "Hạn Đăng Ký Cử Tri",
    mailin_by:     "Hạn Nộp Phiếu Bầu Qua Thư",
    polling:       "Giờ Bỏ Phiếu",
    nonpartisan:   "Công cụ này không thiên vị đảng phái. Không có ứng cử viên hay đảng nào trả tiền để xuất hiện. Tất cả lập trường đều từ hồ sơ công khai và tuyên bố tranh cử.",
  },
  pt: {
    welcome:       "Bem-vindo ao VoterAlign Philly. 👋",
    welcome_sub:   "Vou ajudá-lo a encontrar candidatos de 2026 que compartilham seus valores — sem viés, sem pressão de partido. Apenas alinhamento.",
    ask_zip:       "Para começar, qual é o seu CEP de Filadélfia?",
    zip_found:     "Encontrado — CEP {zip}. Você tem {n} corridas na sua cédula:",
    zip_next:      "A seguir, vou perguntar quais assuntos são mais importantes para você.",
    continue_btn:  "Escolher meus assuntos →",
    zip_error:     "Este não parece ser um CEP de Filadélfia. Tente algo como 19103, 19143 ou 19120.",
    zip_invalid:   "Por favor, insira um CEP válido de 5 dígitos.",
    zip_placeholder: "Digite seu CEP (ex. 19103)",
    send:          "Enviar",
    choose_lang:   "Escolha seu idioma para começar:",
    split_prompt:  "Seu CEP abrange dois distritos estaduais. Em qual bairro você está?",
    how_title:     "Como funciona",
    step1:         "Digite seu CEP — encontramos sua cédula exata",
    step2:         "Escolha seus assuntos — transporte, habitação, educação e mais",
    step3:         "Responda perguntas simples — leva cerca de 2 minutos",
    step4:         "Veja suas correspondências — classificadas por alinhamento, não por partido",
    election_title:"Informações Eleitorais",
    primary_date:  "Data da Eleição Primária",
    register_by:   "Prazo de Registro de Eleitor",
    mailin_by:     "Prazo para Voto por Correio",
    polling:       "Horário de Votação",
    nonpartisan:   "Esta ferramenta é não partidária. Nenhum candidato ou partido pagou pela inclusão. Todas as posições são de registros públicos e declarações de campanha.",
  },
};

type Msg =
  | { from: "bot";     text: string; sub?: string }
  | { from: "bot-zip-results"; offices: any[]; zip: string }
  | { from: "bot-split"; offices: any[] }
  | { from: "bot-continue"; offices: any[] }
  | { from: "user";    text: string };

export default function HomePage() {
  const router  = useRouter();
  const election = getElection();
  const [lang,   setLang]   = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,  setInput]  = useState("");
  const [done,   setDone]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const t = (key: string, vars?: Record<string,string>) => {
    const dict = T[lang ?? "en"] ?? T["en"];
    let str = dict[key] ?? T["en"][key] ?? key;
    if (vars) Object.entries(vars).forEach(([k,v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (lang && !done) inputRef.current?.focus(); }, [lang, done]);

  function push(msg: Msg) { setMessages(p => [...p, msg]); }

  function selectLanguage(code: string) {
    setLang(code);
    const dict = T[code] ?? T["en"];
    setTimeout(() => push({ from: "bot", text: dict["welcome"], sub: dict["welcome_sub"] }), 100);
    setTimeout(() => push({ from: "bot", text: dict["ask_zip"] }), 700);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const zip = input.trim();
    if (!zip) return;
    setInput("");
    push({ from: "user", text: zip });

    setTimeout(() => {
      if (!/^\d{5}$/.test(zip)) {
        push({ from: "bot", text: t("zip_invalid") });
        return;
      }
      const offices = getOfficesForZip(zip);
      const nonGov  = offices.filter((o: any) => o.id !== "governor");
      if (!offices.length || !nonGov.length) {
        push({ from: "bot", text: t("zip_error") });
        return;
      }

      // Check for split districts
      const stateOnly = offices.filter((o: any) => o.id !== "governor" && o.level === "state");
      const hasSplit  = stateOnly.length > 1;

      push({ from: "bot-zip-results", offices, zip });

      setTimeout(() => {
        if (hasSplit) {
          push({ from: "bot", text: t("split_prompt") });
          setTimeout(() => push({ from: "bot-split", offices }), 400);
        } else {
          push({ from: "bot", text: t("zip_next") });
          setTimeout(() => { push({ from: "bot-continue", offices }); setDone(true); }, 400);
        }
      }, 600);
    }, 380);
  }

  function continueWithOffices(offices: any[]) {
    clearQuizAnswers();
    saveSelectedTopics([]);
    saveSelectedZip(input || "");
    saveMatchedOffices(offices.map((o: any) => o.id));
    router.push("/topics");
  }

  // ── Language picker ───────────────────────────────────────────────
  if (!lang) {
    return (
      <main className="page-shell">
        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "3rem" }}>

          {/* Masthead */}
          <div className="bs-masthead">
            <div className="bs-masthead-stars">★  ★  ★</div>
            <div className="bs-pub-date">May 19, 2026 · Philadelphia, Pennsylvania · Primary Election</div>
            <div className="bs-title">VoterAlign</div>
            <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
            <div className="bs-masthead-footer">Nonpartisan · Transparent · Philadelphia 2026</div>
          </div>

          {/* Language selection card */}
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "var(--parchment-mid)", border: "2px solid var(--ink)", marginBottom: "1.5rem" }}>
              {/* Chat header */}
              <div style={{ background: "var(--ink)", padding: ".9rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", flexShrink: 0 }}>⚖</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".97rem", color: "#e8d5a0" }}>VoterAlign Guide</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".08em", color: "#a89060", marginTop: ".05rem" }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#4ade80", marginRight: ".3rem", verticalAlign: "middle" }} />
                    Nonpartisan · Civic Guide
                  </div>
                </div>
              </div>

              {/* Bot message */}
              <div style={{ padding: "1.25rem 1.25rem .5rem" }}>
                <div style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0, fontFamily: "'Playfair Display',serif" }}>⚖</div>
                  <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", padding: ".85rem 1rem", borderRadius: "2px 14px 14px 14px", fontFamily: "'EB Garamond',serif", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.7 }}>
                    {T["en"]["choose_lang"]}
                  </div>
                </div>

                {/* Language buttons */}
                <div style={{ paddingLeft: "2.65rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: ".5rem", marginBottom: "1.25rem" }}>
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => selectLanguage(l.code)}
                      style={{
                        display: "flex", alignItems: "center", gap: ".5rem",
                        padding: ".65rem .9rem",
                        border: "1.5px solid var(--rule)",
                        background: "var(--parchment-mid)",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 600,
                        fontSize: ".88rem",
                        color: "var(--ink)",
                        transition: "border-color .14s, background .14s",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.background = "var(--parchment-dark)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--rule)"; (e.currentTarget as HTMLElement).style.background = "var(--parchment-mid)"; }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info panel below */}
            <div className="bs-how-grid">
              <div style={{ paddingRight: "1.25rem" }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--gold)", borderBottom: "1px solid var(--rule)", paddingBottom: ".4rem", marginBottom: ".85rem" }}>How It Works</div>
                {[
                  { n: "I.",   t: "Enter your ZIP code",          d: "We find every race on your ballot" },
                  { n: "II.",  t: "Pick your issues",              d: "Transit, housing, education & more" },
                  { n: "III.", t: "Answer plain questions",        d: "No jargon — takes about 2 minutes" },
                  { n: "✦",   t: "See your matches",              d: "Ranked by alignment, not party" },
                ].map((s, i) => (
                  <div key={i} className="bs-how-step">
                    <div className="bs-how-num">{s.n}</div>
                    <div><div className="bs-how-title">{s.t}</div><div className="bs-how-desc">{s.d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ background: "repeating-linear-gradient(to bottom,var(--ink) 0,var(--ink) 4px,transparent 4px,transparent 8px)", width: 1, flexShrink: 0 }} />
              <div style={{ paddingLeft: "1.25rem" }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".12em", color: "var(--gold)", borderBottom: "1px solid var(--rule)", paddingBottom: ".4rem", marginBottom: ".85rem" }}>Election Information</div>
                <div className="bs-election-table">
                  {[
                    { label: "Primary Election Date", value: "May 19, 2026" },
                    { label: "Voter Registration",    value: "By May 4, 2026" },
                    { label: "Mail-In Ballot",        value: "By May 12, 2026" },
                    { label: "Polling Hours",         value: election?.pollingHours ?? "7 AM – 8 PM" },
                  ].map((r, i) => (
                    <div key={i} className="bs-election-row">
                      <span className="bs-election-label">{r.label}</span>
                      <span className="bs-election-value">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bs-info-box" style={{ marginTop: ".85rem" }}>
                  This publication is nonpartisan. No candidate or party has paid for placement.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Chat flow (after language selected) ──────────────────────────
  return (
    <main className="page-shell">
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

        {/* Masthead */}
        <div className="bs-masthead">
          <div className="bs-masthead-stars">★  ★  ★</div>
          <div className="bs-pub-date">May 19, 2026 · Philadelphia, Pennsylvania · Primary Election</div>
          <div className="bs-title">VoterAlign</div>
          <div className="bs-subtitle">The Voter's Record of Candidate Alignment</div>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Language switcher */}
          <div style={{ display: "flex", gap: ".4rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--gold)" }}>Language:</span>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setMessages([]); setDone(false); setInput(""); }}
                style={{
                  padding: ".22rem .6rem",
                  border: lang === l.code ? "1.5px solid var(--ink)" : "1px solid var(--rule)",
                  background: lang === l.code ? "var(--parchment-dark)" : "var(--parchment-mid)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: ".72rem",
                  fontWeight: lang === l.code ? 700 : 500,
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Chat card */}
          <div style={{ background: "var(--parchment-mid)", border: "2px solid var(--ink)" }}>

            {/* Header */}
            <div style={{ background: "var(--ink)", padding: ".9rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", flexShrink: 0 }}>⚖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".97rem", color: "#e8d5a0" }}>VoterAlign Guide</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".08em", color: "#a89060", marginTop: ".05rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#4ade80", marginRight: ".3rem", verticalAlign: "middle" }} />
                  {LANGUAGES.find(l => l.code === lang)?.label} · Nonpartisan Civic Guide
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".9rem", minHeight: 220 }}>
              {messages.map((msg, i) => {
                if (msg.from === "bot") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", animation: "fadeUp .25s ease both" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", padding: ".8rem 1rem", borderRadius: "2px 14px 14px 14px", maxWidth: "82%" }}>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.7 }}>{msg.text}</div>
                      {msg.sub && <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: ".85rem", color: "var(--ink-mid)", marginTop: ".4rem", lineHeight: 1.6 }}>{msg.sub}</div>}
                    </div>
                  </div>
                );

                if (msg.from === "bot-zip-results") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", padding: ".8rem 1rem", borderRadius: "2px 14px 14px 14px", maxWidth: "82%", flex: 1 }}>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.7, marginBottom: ".6rem" }}>
                        {t("zip_found", { zip: msg.zip, n: String(msg.offices.length) })}
                      </div>
                      <div style={{ display: "grid", gap: ".25rem" }}>
                        {msg.offices.map((o: any) => (
                          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: ".28rem 0", borderBottom: "1px dotted var(--rule-soft)", fontFamily: "'EB Garamond',serif", fontSize: ".9rem" }}>
                            <span style={{ color: "var(--ink-soft)" }}>{o.name}</span>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".6rem", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gold)", marginLeft: ".75rem", flexShrink: 0 }}>{o.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );

                if (msg.from === "bot-split") {
                  const stateOnly = msg.offices.filter((o: any) => o.id !== "governor" && o.level === "state");
                  const base = msg.offices.filter((o: any) => o.id === "governor" || o.level === "federal");
                  return (
                    <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                      <div style={{ display: "grid", gap: ".4rem" }}>
                        {stateOnly.map((o: any) => (
                          <button key={o.id} onClick={() => { continueWithOffices([...base, o]); }} style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem .9rem", border: "1.5px solid var(--rule)", background: "var(--parchment-mid)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".82rem", color: "var(--ink)", transition: "border-color .14s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--rule)"}
                          >
                            {o.name} →
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (msg.from === "bot-continue") return (
                  <div key={i} style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".75rem", flexShrink: 0 }}>⚖</div>
                    <button
                      onClick={() => continueWithOffices(msg.offices)}
                      className="btn-bs"
                    >
                      {t("continue_btn")}
                    </button>
                  </div>
                );

                if (msg.from === "user") return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-end", gap: ".65rem" }}>
                    <div style={{ background: "var(--ink)", color: "#e8d5a0", padding: ".7rem .95rem", borderRadius: "14px 2px 14px 14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: ".9rem", maxWidth: "70%" }}>
                      {msg.text}
                    </div>
                  </div>
                );

                return null;
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!done && (
              <form onSubmit={handleSubmit} style={{ borderTop: "1px solid var(--rule)", display: "flex", gap: ".65rem", padding: ".85rem 1.1rem", background: "var(--parchment)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t("zip_placeholder")}
                  maxLength={5}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  style={{ flex: 1, border: "none", borderBottom: "1.5px solid var(--ink)", background: "transparent", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "var(--ink)", outline: "none", padding: ".2rem 0" }}
                />
                <button type="submit" className="btn-bs" style={{ flexShrink: 0 }}>{t("send")} →</button>
              </form>
            )}
          </div>

          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    </main>
  );
}
