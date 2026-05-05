export function getScopeMultiplier(candidate: any, question: any) {
  let multiplier = 1;

  if (question.relevantOfficeIds?.includes(candidate.officeId)) {
    multiplier *= 2;
  }

  if (candidate.officeLevel === "state" && question.scope === "state") {
    multiplier *= 1.5;
  }

  if (candidate.officeLevel === "federal" && question.scope === "federal") {
    multiplier *= 1.5;
  }

  return multiplier;
}

type ScopeBreakdown = Record<string, { earned: number; possible: number; percentage: number }>;

function createEmptyScopeBreakdown(): ScopeBreakdown {
  return {
    state: { earned: 0, possible: 0, percentage: 0 },
    federal: { earned: 0, possible: 0, percentage: 0 },
    local_shared: { earned: 0, possible: 0, percentage: 0 }
  };
}

function finalizeBreakdown(breakdown: any) {
  const keys = ["state", "federal", "local_shared"] as const;

  const output: any = {};
  for (const key of keys) {
    output[key] = {
      ...breakdown[key],
      percentage:
        breakdown[key].possible === 0
          ? 0
          : Math.round((breakdown[key].earned / breakdown[key].possible) * 100)
    };
  }

  return output;
}

export function scoreCandidate(
  candidate: any,
  questions: any[],
  userAnswers: Record<string, number>,
  selectedTopics: string[] = []
) {
  let earned = 0;
  let possible = 0;

  const agreements: string[] = [];
  const differences: string[] = [];
  const scopeBreakdown = createEmptyScopeBreakdown();

  for (const question of questions) {
    const userAnswer = userAnswers[question.id];
    const candidatePosition = candidate.positions?.[question.id];

    if (userAnswer === null || userAnswer === undefined || !candidatePosition) {
      continue;
    }

    const baseWeight = question.weight ?? 1;
    const scopeMultiplier = getScopeMultiplier(candidate, question);
    const topicMultiplier =
      selectedTopics.includes(question.topic) ? 2 : 1;

    const totalWeight = baseWeight * scopeMultiplier * topicMultiplier;

    const gap = Math.abs(userAnswer - candidatePosition.stance);
    const points = Math.max(0, 2 - gap);

    const questionPossible = 2 * totalWeight;
    const questionEarned = points * totalWeight;

    possible += questionPossible;
    earned += questionEarned;

    const scopeKey =
      question.scope === "state" || question.scope === "federal"
        ? question.scope
        : "local_shared";

    scopeBreakdown[scopeKey].possible += questionPossible;
    scopeBreakdown[scopeKey].earned += questionEarned;

    if (gap === 0) agreements.push(question.id);
    if (gap >= 2) differences.push(question.id);
  }

  const percentage =
    possible === 0 ? 0 : Math.round((earned / possible) * 100);

  return {
    candidateId: candidate.id,
    officeId: candidate.officeId,
    score: earned,
    percentage,
    agreements,
    differences,
    scopeBreakdown: finalizeBreakdown(scopeBreakdown)
  };
}

export function rankCandidates(
  candidates: any[],
  questions: any[],
  userAnswers: Record<string, number>,
  selectedTopics: string[] = []
) {
  return candidates
    .map((candidate) =>
      scoreCandidate(candidate, questions, userAnswers, selectedTopics)
    )
    .sort((a, b) => b.percentage - a.percentage || b.score - a.score);
}
