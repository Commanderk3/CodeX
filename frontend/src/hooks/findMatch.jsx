import socket from "../socket";

export function useFindMatch({ user, isFindingMatch, setIsFindingMatch }) {
  const findMatch = () => {
    if (!user) return;

    console.log("Before match", isFindingMatch);

    if (isFindingMatch) {
      setIsFindingMatch(false);
      socket.emit("cancel-match", { playerName: user.username });
      return;
    }

    setIsFindingMatch(true);

    if (!socket.connected) socket.connect();

    const hasLiveSession = user.matchHistory.some(
      (match) => match.result === "live"
    );

    if (hasLiveSession) {
      console.log("Already in a Game. Quit it before starting a new one.");
      // setIsFindingMatch(false);
      // return;
    }

    socket.emit("find-match", {
      playerName: user.username,
      avatar: user.avatar,
      rating: user.rating,
    });
  };

  return { findMatch };
}
