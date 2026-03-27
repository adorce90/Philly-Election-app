import election from "../data/election.json";
import offices from "../data/offices.json";
import questions from "../data/questions.json";
import candidates from "../data/candidates.json";

export function getElection() {
  return election;
}

export function getOffices() {
  return offices;
}

export function getQuestions() {
  return questions;
}

export function getQuestionsByOffice(officeId: string) {
  return questions.filter((q: any) => {
    if (!q.relevantOfficeIds || q.relevantOfficeIds.length === 0) {
      return true;
    }
    return q.relevantOfficeIds.includes(officeId);
  });
}

export function getQuestionsByOfficesAndTopics(
  officeIds: string[],
  topics: string[]
) {
  return questions.filter((q: any) => {
    const officeMatch =
      !q.relevantOfficeIds ||
      q.relevantOfficeIds.some((id: string) => officeIds.includes(id));

    const topicMatch =
      !topics || topics.length === 0 || topics.includes(q.topic);

    return officeMatch && topicMatch;
  });
}

export function getCandidates() {
  return candidates;
}

export function getCandidatesByOffice(officeId: string) {
  return candidates.filter((c: any) => c.officeId === officeId);
}

export function getCandidatesByOffices(officeIds: string[]) {
  return candidates.filter((c: any) => officeIds.includes(c.officeId));
}

export function getCandidateById(id: string) {
  return candidates.find((c: any) => c.id === id);
}

export function getUniqueTopics() {
  return Array.from(new Set(questions.map((q: any) => q.topic)));
}

export function getOfficesForZip(zip: string) {
  return offices.filter((office: any) => {
    if (office.zipCodes?.includes("all")) return true;
    return office.zipCodes?.includes(zip);
  });
}

/* Temporary Promise Tracker stubs so candidate page keeps working */
export function getPromises() {
  return [];
}

export function getPromisesByCandidateId(_candidateId: string) {
  return [];
}
