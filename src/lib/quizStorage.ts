const QUIZ_ANSWERS_KEY = "philly-2026-quiz-answers";
const QUIZ_OFFICE_KEY = "philly-2026-selected-office";

export function saveQuizAnswers(answers: Record<string, number>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(answers));
}

export function loadQuizAnswers(): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(QUIZ_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearQuizAnswers() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUIZ_ANSWERS_KEY);
}

export function saveSelectedOffice(officeId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUIZ_OFFICE_KEY, officeId);
}

export function loadSelectedOffice(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(QUIZ_OFFICE_KEY);
}

export function clearQuizSession() {
  clearQuizAnswers();
  if (typeof window !== "undefined") {
    localStorage.removeItem(QUIZ_OFFICE_KEY);
  }
}
