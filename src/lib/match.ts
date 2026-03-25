export function getScopeMultiplier(candidate: any, question: any) {
  if (candidate.officeLevel === "state" && question.scope === "state") {
    return 2;
  }

  if (candidate.officeLevel === "federal" && question.scope === "federal") {
    return 2;
  }

  return 1;
}

function createEmptyScopeBreakdown() {
  return {
    state: { earned: 0, possible: 0, percentage: 0 },
    federal: { earned: 0, possible: 0, percentage: 0 },
    local_shared: { earned: 0, possible: 0, percentage: 0 }
  };
}

function finalizeBreakdown(breakdown: any) {
  return {
    state: {
      ...breakdown.state,
      percentage:
        breakdown.state.possible === 0
          ? 0
          : Math.round((breakdown.state.earned / breakdown.state.possible) * 100)
    },
    federal: {
      ...breakdown.federal,
      percentage:
        breakdown.federal.possible === 0
          ? 0
          : Math.round((breakdown.federal.earned / breakdown.federal.possible) * 100)
    },
    local_shared: {
      ...breakdown.local_shared,
      percentage:
        breakdown.local_shared.possible === 0
          ? 0
          : Math.round((breakdown.local_shared.earned / breakdown.local_shared.possible) * 100)
    }
  };
}

export function scoreCandidate(candidate: any, questions: any[], userAnswers: Record<string, number>) {
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
    const totalWeight = baseWeight * scopeMultiplier;

    const gap = Math.abs(userAnswer - candidatePosition.stance);
    const points = Math.max(0, 2 - gap);

    const questionPossible = 2 * totalWeight;
    const questionEarned = points * totalWeight;

    possible += questionPossible;
    earned += questionEarned;

    scopeBreakdown[question.scope].possible += questionPossible;
    scopeBreakdown[question.scope].earned += questionEarned;

    if (gap === 0) agreements.push(question.id);
    if (gap >= 2) differences.push(question.id);
  }

  const percentage = possible === 0 ? 0 : Math.round((earned / possible) * 100);

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

export function rankCandidates(candidates: any[], questions: any[], userAnswers: Record<string, number>) {
  return candidates
    .map((candidate) => scoreCandidate(candidate, questions, userAnswers))
    .sort((a, b) => b.percentage - a.percentage || b.score - a.score);
}
