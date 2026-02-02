import { Socket } from "socket.io";
import { Server } from "socket.io";

import { submitBatch, getBatchSubmission } from "../services/codeRunner.service";
import { checkTestCases } from "../services/checkTestCases";
import { generateSubmissions } from "../services/generateSubmissions";
import questions from "../../question2.json";

import { findRoomById } from "../state/activeRooms";

import { updateTestCase } from "../services/gameManager";
import { updateTestCaseInRoom } from "../services/roomManager";

import { SubmitCodePayload } from "../types/codeRunner";
import { Judge0BatchResponse, Judge0BatchResult } from "../types/jude0";
import { CodeResult } from "../types/jude0";
import { CustomSocket } from "../types/global";

export const submitCode = (socket: CustomSocket, io: Server) => {
  socket.on("submit-code", async (data: SubmitCodePayload) => {
    try {
      const { language_id, source_code, roomId, playerName } = data;

      const room = findRoomById(roomId);
      if (!room) {
        socket.emit("systemMessage", { type: "error", message: "Room not found" });
        return;
      }

      const questionIndex = room.questionId;
      if (!questionIndex) return;
      const question = questions[questionIndex];

      const inputTests = question.test_cases;
      const templates = question.template;

      let templateCode: string;

      switch (language_id) {
        case 54:
          templateCode = templates["c++"];
          break;
        case 71:
          templateCode = templates["python"];
          break;
        case 63:
          templateCode = templates["javascript"];
          break;
        default:
          templateCode = templates["java"];
      }

      const submissions = generateSubmissions(
        language_id,
        source_code,
        templateCode,
        inputTests
      );

      const tokenData: Judge0BatchResponse = await submitBatch(submissions);
      const result: Judge0BatchResult = await getBatchSubmission(tokenData);
      const codeResult: CodeResult = checkTestCases(result.submissions, inputTests);
      if (codeResult === undefined) return;
      console.log("codeResult", codeResult);

      const testCasePassed = codeResult.mismatchedAt;
      if (testCasePassed === null) return;

      if (socket.user === undefined) return;

      const userId = socket.user.id;

      if (room.type === "classic") {
        updateTestCase(
          roomId,
          userId,
          testCasePassed,
          codeResult.resultStatus,
          io
        );
      } else {
        updateTestCaseInRoom(roomId, userId, testCasePassed);
      }

      socket.emit("code-result", { codeResult });

      socket.to(roomId).emit("opponent-progress", {
        playerName,
        mismatchedAt: testCasePassed,
      });

    } catch (err) {
      console.error(err);
      socket.emit("error", {
        message: "Something went wrong while submitting code.",
      });
    }
  });
};
