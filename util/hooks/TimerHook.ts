import { useEffect, useState } from "react";

/** Hook that will refresh the component periodically with a certain timeout, in milliseconds. 
 * Returns the time of the last refresh. */
export function useTimerRefresh(timeoutMs: number): number {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    // Set interval
    const interval = setInterval(() => {
      setTime(Date.now());
    }, timeoutMs);

    // Clear interval on dismount
    return () => {
      clearInterval(interval);
    }
  });

  return time;
}
