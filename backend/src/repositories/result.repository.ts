import User from "../models/User";
import { CustomRoom, Winner, ClassicGame } from "../types/global";

interface PlayerResult {
  testCasePassed: number;
  timeTaken: number;
  rating: number;
  won: boolean;
  draw: boolean;
}

type MatchResults = Record<string, PlayerResult>;

async function addGametoUserProfile(
  player1,
  player2,
  roomId,
  question,
  startTime,
) {
  await Promise.all(
    [player1, player2].map((p) => {
      const opponent =
        String(p.userId) === String(player1.userId) ? player2 : player1;
      return User.findByIdAndUpdate(p.userId, {
        $push: {
          matchHistory: {
            roomId,
            opponents: [
              {
                playerName: opponent.playerName,
                avatar: opponent.avatar, // Add avatar
                testCasePassed: 0,
                timeTaken: 0,
                // No userId field
              },
            ],
            result: "live",
            totalTestCases: question.test_cases.length, // Add this
            testCasePassed: 0,
            questionTitle: question.title,
            completedAt: startTime,
          },
        },
      });
    }),
  );
}

async function updateClassicGameResults(
  roomId: string,
  room: ClassicGame,
  question,
  results: MatchResults,
) {
  console.log(`Updating results for room ${roomId}`);

  const updates = room.players.map(async (p) => {
    const playerResult = results[p.userId];
    if (!playerResult) {
      console.log(`No result found for player ${p.userId}`);
      return null;
    }

    // Build opponents array matching the schema
    const opponents = room.players
      .filter((o) => o.userId !== p.userId)
      .map((o) => ({
        playerName: o.playerName,
        avatar: o.avatar, // Add avatar as it's in schema
        testCasePassed: results[o.userId]?.testCasePassed ?? 0,
        timeTaken: Number(results[o.userId]?.timeTaken) || 0,
        // Note: No userId field as it's not in schema
      }));

    const safeRating = Number.isFinite(playerResult.rating)
      ? playerResult.rating
      : p.rating;

    console.log(`Updating user ${p.userId} with rating ${safeRating}`);

    try {
      // Build the update object matching schema
      const updateData = {
        "matchHistory.$.opponents": opponents,
        "matchHistory.$.result": playerResult.won
          ? "victory"
          : playerResult.draw
            ? "draw"
            : "defeat",
        "matchHistory.$.testCasePassed": playerResult.testCasePassed,
        "matchHistory.$.timeTaken": Number(playerResult.timeTaken) || 0,
        "matchHistory.$.completedAt": new Date(), // Use current time
        "matchHistory.$.questionTitle": question.title,
        "matchHistory.$.totalTestCases": question.test_cases.length, // Added this
        rating: safeRating,
      };

      console.log("Update data:", updateData);

      // Update the existing matchHistory entry
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: p.userId,
          "matchHistory.roomId": roomId,
        },
        {
          $set: updateData,
        },
        { new: true },
      );

      if (!updatedUser) {
        console.log(
          `No matchHistory found with roomId ${roomId} for user ${p.userId}`,
        );

        // Create a new matchHistory entry instead
        const newMatchHistory = {
          roomId,
          opponents,
          result: playerResult.won
            ? "victory"
            : playerResult.draw
              ? "draw"
              : "defeat",
          totalTestCases: question.test_cases.length,
          testCasePassed: playerResult.testCasePassed,
          timeTaken: Number(playerResult.timeTaken) || 0,
          questionTitle: question.title,
          completedAt: new Date(),
        };

        return User.findByIdAndUpdate(
          p.userId,
          {
            $push: { matchHistory: newMatchHistory },
            $set: { rating: safeRating },
          },
          { new: true },
        );
      }

      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${p.userId}:`, error);
      return null;
    }
  });

  const updateResults = await Promise.all(updates.filter(Boolean));
  console.log("Update results:", updateResults);
  return updateResults;
}

async function updateGameResultsInRoom(
  room: CustomRoom,
  roomId: string,
  questionName: string,
  leaderboard: Winner[],
) {
  const bulkOps = room.players.map((player) => ({
    updateOne: {
      filter: {
        _id: player.userId,
      },
      update: {
        $setOnInsert: {
          roomMatchHistory: [],
        },
        $push: {
          roomMatchHistory: {
            $each: [
              {
                roomId,
                roomName: room.roomName,
                createdAt: room.createdAt,
                gameResults: [{ questionName, leaderboard }],
              },
            ],
          },
        },
      },
      upsert: false, // user already exists
    },
  }));

  await User.bulkWrite(bulkOps);
}

export {
  addGametoUserProfile,
  updateGameResultsInRoom,
  updateClassicGameResults,
};
