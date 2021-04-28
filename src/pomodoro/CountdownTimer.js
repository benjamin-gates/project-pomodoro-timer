import {secondsToDuration} from "../utils/duration";
import React from "react";
function CountdownTimer ({session}){
    if (session){
        return <p className="lead" data-testid="session-sub-title">
        {secondsToDuration(session.timeRemaining)} remaining
      </p>
    }
    else return null;
}

export default CountdownTimer;