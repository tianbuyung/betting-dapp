import { useState, useEffect, useCallback } from "react";

export const CountdownTimer = ({
  targetTimestamp,
}: {
  targetTimestamp: number;
}) => {
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const difference = targetTimestamp * 1000 - now;

    let timeLeft = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      timeLeft = {
        hours,
        minutes,
        seconds,
      };
    } else {
      timeLeft = { hours: 0, minutes: 0, seconds: 0 };
    }

    return timeLeft;
  }, [targetTimestamp]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetTimestamp, calculateTimeLeft]);

  return (
    <div>
      <h1 className="font-bold">
        {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}:
        {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}:
        {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
      </h1>
    </div>
  );
};
