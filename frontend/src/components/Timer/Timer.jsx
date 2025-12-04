import { useEffect, useState } from "react";

const Timer = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime); // time in ms

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0)); // decrease by 1s
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return <div className="match-timer">{formatTime(timeLeft)}</div>;
};

export default Timer;
