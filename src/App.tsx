import { ReactElement, useCallback, useEffect, useState, WheelEvent } from 'react';
import './App.scss';

/* eslint-disable prettier/prettier */
const interval =
  (delay = 0) =>
    (callback: () => void): void => {
      useEffect(() => {
        const id = setInterval(callback, delay);
        return (): void => clearInterval(id);
      }, [callback]);
    };
const useSecondInterval = interval(1000);
/* eslint-enable prettier/prettier */

function App(): ReactElement {
  const [time, setTime] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  const resetTime = (): void => {
    setIsStarted(false);
    setTime(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === ' ' && time !== 0) {
        setIsStarted(!isStarted);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return (): void => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleWheel = (e: WheelEvent, type: string): void => {
    if (!isStarted) {
      const maxMinutesCondition = type === 'minutes' && minutes === 59;
      const maxTimeCondition = type === 'seconds' && time === 60 * 60 - 1;
      if (e.deltaY > 0 && time === 0) return;
      if (e.deltaY < 0 && (maxMinutesCondition || maxTimeCondition)) return;
      const value = type === 'seconds' ? 1 : 60;
      setTime(e.deltaY < 0 ? time + value : time - value);
    }
  };

  /* eslint-disable prettier/prettier */
  const tick = useCallback(() => {
    if (isStarted) {
      if (time === 1) {
        resetTime();
        const img = '/public/clock.png';
        const text = 'Your timer has ended.';
        // eslint-disable-next-line no-new
        new Notification('Timer', { body: text, icon: img });
      }
      setTime(time - 1);
    }
  }, [isStarted, time]
  );
  /* eslint-enable prettier/prettier */

  const startTimer = (): void => {
    if (time === 0) return;
    setIsStarted(true);
  };
  const stopTimer = (): void => setIsStarted(false);

  useSecondInterval(tick);

  return (
    <div className="timer">
      <div className="time">
        <div className="minutes time-element" onWheel={(e) => handleWheel(e, 'minutes')}>
          <p style={{ width: minutes < 10 ? '65px' : '125px' }}>{minutes}</p>
          <span className="time-unit">m</span>
        </div>
        <div className="seconds time-element" onWheel={(e) => handleWheel(e, 'seconds')}>
          <p style={{ width: '125px' }}>
            {seconds < 10 && '0'}
            {seconds}
          </p>
          <span className="time-unit">s</span>
        </div>
      </div>
      <div className="button_container">
        {!isStarted && (
          <button className="start_button" onClick={() => startTimer()}>
            Start
          </button>
        )}
        {isStarted && (
          <button className="stop_button" onClick={() => stopTimer()}>
            Stop
          </button>
        )}
        <button className="reset_button" onClick={() => resetTime()}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;
