const ANSWERS_KEY = "philly-election-answers";
const SELECTED_OFFICE_KEY = "philly-election-selected-office";
const SELECTED_TOPICS_KEY = "philly-election-selected-topics";
const SELECTED_ZIP_KEY = "philly-election-selected-zip";
const MATCHED_OFFICES_KEY = "philly-election-matched-offices";

export function loadQuizAnswers(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveQuizAnswers(answers: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function clearQuizAnswers() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ANSWERS_KEY);
}

export function loadSelectedOffice(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_OFFICE_KEY);
}

export function saveSelectedOffice(officeId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_OFFICE_KEY, officeId);
}

export function loadSelectedTopics(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTED_TOPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSelectedTopics(topics: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_TOPICS_KEY, JSON.stringify(topics));
}

export function loadSelectedZip(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_ZIP_KEY);
}

export function saveSelectedZip(zip: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_ZIP_KEY, zip);
}

export function loadMatchedOffices(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MATCHED_OFFICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMatchedOffices(offices: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MATCHED_OFFICES_KEY, JSON.stringify(offices));
}
