import { useState, useEffect, useCallback, useRef } from 'react';

export function parseTimeLimit(limit) {
  if (!limit) return null;
  const match = limit.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    default: return null;
  }
}

export function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function useTimer(limit = null, onTimeUp = null) {
  const limitSeconds = parseTimeLimit(limit);
  const isCountdown = limitSeconds !== null;
  const [time, setTime] = useState(isCountdown ? limitSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!isRunning || isFinished) return;
    const interval = setInterval(() => {
      setTime(prev => {
        const next = isCountdown ? prev - 1 : prev + 1;
        if (isCountdown && next <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          onTimeUpRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isFinished, isCountdown]);

  const start = useCallback(() => {
    if (!isFinished) setIsRunning(true);
  }, [isFinished]);

  const pause = useCallback(() => setIsRunning(false), []);
  const stop = useCallback(() => { setIsRunning(false); setIsFinished(true); }, []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setTime(isCountdown ? limitSeconds : 0);
  }, [isCountdown, limitSeconds]);

  return { time, formattedTime: formatTime(time), isRunning, isFinished, isCountdown, start, pause, stop, reset };
}
