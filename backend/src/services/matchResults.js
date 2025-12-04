function matchResults(player1, player2, startTime, totalTestCases) {
  const { rating: r1, lastSubmittedTime: lt1, playerName: n1 } = player1;
  const { rating: r2, lastSubmittedTime: lt2, playerName: n2 } = player2;

  // Calculate time in minutes (less time = better)
  const t1 = ((lt1 - startTime) / 60000).toFixed(3);
  const t2 = ((lt2 - startTime) / 60000).toFixed(3);

  const p1 = player1.testCasePassed / totalTestCases;
  const p2 = player2.testCasePassed / totalTestCases;

  // Determine winner
  let winner = null;
  if (p1 === p2 && t1 === t2) winner = 0;
  else if (p1 > p2 || (p1 === p2 && t1 < t2)) winner = 1;
  else winner = 2;

  // ELO expected scores
  const expected1 = 1 / (1 + 10 ** ((r2 - r1) / 400));
  const expected2 = 1 - expected1;

  // Time bonus
  const maxTime = 120;
  const timeBonus1 = 1 - Math.min(t1 / maxTime, 1);
  const timeBonus2 = 1 - Math.min(t2 / maxTime, 1);

  // Performance score
  const perf1 = (p1 + timeBonus1) / 2;
  const perf2 = (p2 + timeBonus2) / 2;

  let change1, change2;
  if (winner === 0) {
    change1 = (0.5 - expected1) * perf1 * 20;
    change2 = (0.5 - expected2) * perf2 * 20;
  } else if (winner === 1) {
    change1 = (1 - expected1) * perf1 * 20;
    change2 = (0 - expected2) * (1 - perf2) * 20;
  } else {
    change1 = (0 - expected1) * (1 - perf1) * 20;
    change2 = (1 - expected2) * perf2 * 20;
  }

  // Updated ratings
  const newR1 = Math.max(0, Math.min(1000, Math.round(r1 + change1)));
  const newR2 = Math.max(0, Math.min(1000, Math.round(r2 + change2)));

  // Return mapped by player names
  return {
    [n1]: {
      ...player1,
      timeTaken: t1,
      rating: newR1,
      won: winner === 1,
      draw: winner === 0,
    },
    [n2]: {
      ...player2,
      timeTaken: t2,
      rating: newR2,
      won: winner === 2,
      draw: winner === 0,
    },
  };
}


/*
{
  player1: {
    timeTaken: 12.34,
    rating: 807,
    testCasePassed: 0.9,
    lastSubmittedTime: 1759251087088,
    won: true,
    draw: false
  },
  player2: {
    timeTaken: 15.67,
    rating: 796,
    testCasePassed: 0.6,
    lastSubmittedTime: 1759251087088,
    won: false,
    draw: false
  }
}
*/ 

module.exports = { matchResults };