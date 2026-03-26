import election from "../data/election.json";
import offices from "../data/offices.json";
import questions from "../data/questions.json";
import candidates from "../data/candidates.json";
import promises from "../data/promises.json";

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
    if (!q.relevantOfficeIds) return true;
    return q.relevantOfficeIds.includes(officeId);
  });
}

export function getCandidates() {
  return candidates;
}

export function getCandidatesByOffice(officeId: string) {
  return candidates.filter((c: any) => c.officeId === officeId);
}

export function getCandidateById(id: string) {
  return candidates.find((c: any) => c.id === id);
}

export function getPromises() {
  return promises;
}

export function getPromisesByCandidateId(candidateId: string) {
  return promises.find((item: any) => item.candidateId === candidateId)?.promises ?? [];
}
