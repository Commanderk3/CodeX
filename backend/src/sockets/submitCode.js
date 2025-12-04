const codeRunnerService = require("../services/codeRunnerService");
const checkTestCases = require("../services/checkTestCases");
const generateSubmissions = require("../services/generateSubmissions");
const questions = require("../../question2.json");

const {
  handlePlayerWin,
  getActiveRooms,
  updateTestCase,
} = require("../services/gameManager");

const getTemplateCode = questions[2].template;

exports.submitCode = (socket, io) => {
  socket.on("submit-code", async (data) => {
    try {
      const { language_id, source_code, roomId, playerName } = data;
      const inputTests = questions[2].test_cases;

      // ✅ Validate room exists
      //   const room = activeRooms[roomId];
      //   if (!room) {
      //     socket.emit("error", { message: "Invalid room ID" });
      //     return;
      //   }

      // ✅ Validate player is part of the room
      //   if (!room.players.includes(socket.id)) {
      //     socket.emit("error", {
      //       message: "You are not a participant in this room",
      //     });
      //     return;
      //   }

      // Run code
      let templateCode;

      if (language_id === 54) {
        templateCode = getTemplateCode["c++"];
      } else if (language_id === 71) {
        templateCode = getTemplateCode["python"];
      } else if (language_id === 63) {
        templateCode = getTemplateCode["javascript"];
      } else {
        templateCode = getTemplateCode["java"];
      }

      const submissions = generateSubmissions.generateSubmissions(
        language_id,
        source_code,
        templateCode,
        inputTests
      );
      const tokenData = await codeRunnerService.submitBatch(submissions);
      const result = await codeRunnerService.getBatchSubmission(tokenData);
      const codeResult = checkTestCases.checkTestCases(
        result.submissions,
        questions[2].test_cases
      );
      const testCasePassed = codeResult.mismatchedAt;
      updateTestCase(roomId, playerName, testCasePassed);

      if (codeResult.resultStatus) {
        handlePlayerWin(roomId, io);
      } else {
        socket.emit("code-result", { codeResult });
        socket.to(roomId).emit("opponent-progress", {
          mismatchedAt: codeResult.mismatchedAt,
        });
      }
    } catch (err) {
      console.error(err);
      socket.emit("error", {
        message: "Something went wrong while submitting code.",
      });
    }
  });
};
