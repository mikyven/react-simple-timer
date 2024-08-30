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

function detectMobile(): boolean {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
  return toMatch.some((toMatchItem) => navigator.userAgent.match(toMatchItem));
}

function App(): ReactElement {
  const [time, setTime] = useState(Number(localStorage.getItem('initialTime')) || 0);
  const [isStarted, setIsStarted] = useState(false);
  const isMobile = detectMobile();
  const hours = Math.floor(time / (60 * 60));
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = time - hours * 3600 - minutes * 60;

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    localStorage.setItem('initialTime', `${time}`);
  }, [time]);

  const resetTime = (): void => {
    setIsStarted(false);
    document.title = 'Timer';
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
      const maxHoursCondition = type === 'hours' && hours === 99;
      const maxMinutesCondition = type === 'minutes' && minutes === 59;
      const maxTimeCondition = time === 99 * 60 * 60 - 1;
      if (e.deltaY > 0 && (time === 0 || (type === 'minutes' && minutes === 0) || (type === 'hours' && hours === 0))) {
        return;
      }
      if (e.deltaY < 0 && (maxHoursCondition || maxMinutesCondition || maxTimeCondition)) {
        return;
      }
      let value = 0;
      switch (type) {
        case 'hours':
          value = 3600;
          break;
        case 'minutes':
          value = 60;
          break;
        case 'seconds':
          value = 1;
          break;
        default:
          break;
      }
      setTime(e.deltaY < 0 ? time + value : time - value);
    }
  };

  function parseTime(t: number): string {
    const convertTime = (value: number): string => `${value < 10 ? `0${value}` : value}`;
    const parsedHours = Math.floor(t / (60 * 60));
    const parsedMinutes = Math.floor((t - parsedHours * 3600) / 60);
    const parsedSeconds = t - parsedHours * 3600 - parsedMinutes * 60;

    return `${convertTime(parsedHours)}:${convertTime(parsedMinutes)}:${convertTime(parsedSeconds)}`;
  }

  /* eslint-disable prettier/prettier */
  const tick = useCallback(() => {
    if (isStarted) {
      if (time === 1) {
        resetTime();
        const img = '/assets/clock.png';
        const text = 'Your timer has ended.';
        // eslint-disable-next-line no-new
        new Notification('Timer', { body: text, icon: img });
        return;
      }
      document.title = `${parseTime(time - 1)} | Timer`;
      setTime(time - 1);
    }
  }, [isStarted, time]
  );
  /* eslint-enable prettier/prettier */

  const startTimer = (): void => {
    if (time === 0) return;
    setIsStarted(true);
    document.title = `${parseTime(time)} | Timer`;
  };
  const stopTimer = (): void => setIsStarted(false);

  useSecondInterval(tick);

  return (
    <>
      {isMobile && <div>Mobile isn't supported yet :)</div>}
      {!isMobile && (
        <div className="timer">
          <div className="time">
            <div className="hours time-element" onWheel={(e) => handleWheel(e, 'hours')}>
              <p style={{ width: hours > 9 ? '125px' : '65px' }}>{hours}</p>
              <span className="time-unit">h</span>
            </div>
            <div className="minutes time-element" onWheel={(e) => handleWheel(e, 'minutes')}>
              <p>
                {minutes < 10 && '0'}
                {minutes}
              </p>
              <span className="time-unit">m</span>
            </div>
            <div className="seconds time-element" onWheel={(e) => handleWheel(e, 'seconds')}>
              <p>
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
      )}
    </>
  );
}

export default App;
