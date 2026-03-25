import election from "@/data/election.json";
import offices from "@/data/offices.json";
import questions from "@/data/questions.json";
import candidates from "@/data/candidates.json";

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

export function getCandidates() {
  return candidates;
}

export function getCandidatesByOffice(officeId: string) {
  return candidates.filter((c: any) => c.officeId === officeId);
}

export function getCandidateById(id: string) {
  return candidates.find((c: any) => c.id === id);
}
