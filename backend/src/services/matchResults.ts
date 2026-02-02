export interface Player {
  userId: string,
  playerName: string;
  rating: number;
  testCasePassed: number;
  lastSubmittedTime: number;
}

export interface MatchResultPlayer extends Player {
  timeTaken: number;
  won: boolean;
  draw: boolean;
}

export type MatchResult = Record<string, MatchResultPlayer>;

export const matchResults = (
  player1: Player,
  player2: Player,
  startTime: number,
  totalTestCases: number
): MatchResult => {
  const r1 = Number.isFinite(player1.rating) ? player1.rating : 0;
  const r2 = Number.isFinite(player2.rating) ? player2.rating : 0;

  const lt1 = Number.isFinite(player1.lastSubmittedTime)
    ? player1.lastSubmittedTime
    : Date.now();

  const lt2 = Number.isFinite(player2.lastSubmittedTime)
    ? player2.lastSubmittedTime
    : Date.now();

  const t1 = Number(((lt1 - startTime) / 60000).toFixed(3));
  const t2 = Number(((lt2 - startTime) / 60000).toFixed(3));

  const safeTotal = totalTestCases || 1;
  const p1 = Math.min(player1.testCasePassed / safeTotal, 1);
  const p2 = Math.min(player2.testCasePassed / safeTotal, 1);

  let winner: 0 | 1 | 2;

  if (p1 === p2 && t1 === t2) winner = 0;
  else if (p1 > p2 || (p1 === p2 && t1 < t2)) winner = 1;
  else winner = 2;

  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 - expected1;

  const maxTime = 120;
  const timeBonus1 = 1 - Math.min(t1 / maxTime, 1);
  const timeBonus2 = 1 - Math.min(t2 / maxTime, 1);

  const perf1 = (p1 + timeBonus1) / 2;
  const perf2 = (p2 + timeBonus2) / 2;

  const K = 20;

  let change1: number;
  let change2: number;

  if (winner === 0) {
    change1 = (0.5 - expected1) * perf1 * K;
    change2 = (0.5 - expected2) * perf2 * K;
  } else if (winner === 1) {
    change1 = (1 - expected1) * perf1 * K;
    change2 = (0 - expected2) * (1 - perf2) * K;
  } else {
    change1 = (0 - expected1) * (1 - perf1) * K;
    change2 = (1 - expected2) * perf2 * K;
  }

  return {
    [player1.userId]: {
      ...player1,
      timeTaken: t1,
      rating: Math.round(Math.max(0, Math.min(1000, r1 + change1))),
      won: winner === 1,
      draw: winner === 0,
    },
    [player2.userId]: {
      ...player2,
      timeTaken: t2,
      rating: Math.round(Math.max(0, Math.min(1000, r2 + change2))),
      won: winner === 2,
      draw: winner === 0,
    },
  };
};
