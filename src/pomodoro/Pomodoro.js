import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import {minutesToDuration} from "../utils/duration";
//import CountdownTimer from "../pomodoro/CountdownTimer.js";
import ActiveSession from "../pomodoro/ActiveSession";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);

  // ToDo: Allow the user to adjust the focus and break duration.
  const [focusDuration, setFocusDuration] = useState(25);
  const handleFocus = (event) => {
    event.preventDefault();
    if(event.target.id === "increaseFocus" && focusDuration < 60) setFocusDuration(focusDuration + 5)
    else if (event.target.id === "decreaseFocus" && focusDuration > 5) setFocusDuration(focusDuration - 5);
  };


  const [breakDuration, setBreakDuration] = useState(5);
  const handleBreak = (event) => {
    event.preventDefault();
    if (event.target.id === "increaseBreak" && breakDuration < 15) setBreakDuration(breakDuration + 1)
    else if (event.target.id === "decreaseBreak" && breakDuration > 1) setBreakDuration(breakDuration - 1);
  };

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(() => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      if (session.label==="Focusing"){
      setProgressBar(((focusDuration*60-session.timeRemaining)/(focusDuration*60))*100);
      } else if(session.label==="On Break") {
        setProgressBar(((breakDuration*60-session.timeRemaining)/(breakDuration*60))*100);
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  const [progressBar, setProgressBar] = useState(0);

  const [stopped, setStopped] = useState(true);

  const [disableStop, setDisableStop] = useState(true);

  const handleStop = () => {
    setDisableStop(true);
    setStopped(!stopped);
    setIsTimerRunning((prevState) => {
      if (!prevState) return prevState
      else {
        const nextState = !prevState;
        return nextState;
      };
    });
  };


  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      setDisableStop(false);
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            setStopped(false);
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          } else if (prevStateSession.label==="Focusing" && prevStateSession.timeRemaining===0){
            return {
              label: "On Break",
              timeRemaining: breakDuration * 60,
            };
          } else if (prevStateSession.label==="On Break" && prevStateSession.timeRemaining===0){
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60
            };
          };
          setStopped(false);
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  return (
    <div className="pomodoro">
      <div className="row">
        <div className="col">
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text" data-testid="duration-focus">
              {/* TODO: Update this text to display the current focus session duration */}
              Focus Duration: {minutesToDuration(focusDuration)}
            </span>
            <div className="input-group-append">
              {/* TODO: Implement decreasing focus duration and disable during a focus or break session */}
              <button
                type="button"
                id="decreaseFocus"
                name="decreaseFocus"
                className="btn btn-secondary"
                data-testid="decrease-focus"
                onClick={handleFocus}
              >
                <span className="oi oi-minus" />
              </button>
              {/* TODO: Implement increasing focus duration  and disable during a focus or break session */}
              <button
                type="button"
                id="increaseFocus"
                name="increaseFocus"
                className="btn btn-secondary"
                data-testid="increase-focus"
                onClick={handleFocus}
              >
                <span className="oi oi-plus" />
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="float-right">
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text" data-testid="duration-break">
                {/* TODO: Update this text to display the current break session duration */}
                Break Duration: {minutesToDuration(breakDuration)}
              </span>
              <div className="input-group-append">
                {/* TODO: Implement decreasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  id="decreaseBreak"
                  name="decreaseBreak"
                  className="btn btn-secondary"
                  data-testid="decrease-break"
                  onClick={handleBreak}
                >
                  <span className="oi oi-minus" />
                </button>
                {/* TODO: Implement increasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  id="increaseBreak"
                  name="increaseBreak"
                  className="btn btn-secondary"
                  data-testid="increase-break"
                  onClick={handleBreak}
                >
                  <span className="oi oi-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group btn-group-lg mb-2"
            role="group"
            aria-label="Timer controls"
          >
            <button
              type="button"
              className="btn btn-primary"
              data-testid="play-pause"
              title="Start or pause timer"
              onClick={playPause}
            >
              <span
                className={classNames({
                  oi: true,
                  "oi-media-play": !isTimerRunning,
                  "oi-media-pause": isTimerRunning,
                })}
              />
            </button>
            {/* TODO: Implement stopping the current focus or break session. and disable the stop button when there is no active session */}
            {/* TODO: Disable the stop button when there is no active session */}
            <button
              type="button"
              disabled={disableStop}
              className="btn btn-secondary"
              data-testid="stop"
              title="Stop the session"
              onClick={handleStop}
            >
              <span className="oi oi-media-stop" />
            </button>
          </div>
        </div>
      </div>
      <ActiveSession session={session} progressBar={progressBar} stopped={stopped} focusDuration={focusDuration} breakDuration={breakDuration}/>
        {/* TODO: This area should show only when there is an active focus or break - i.e. the session is running or is paused */}
            {/* TODO: Update message below correctly format the time remaining in the current session */}
    </div>
  );
}

export default Pomodoro;
