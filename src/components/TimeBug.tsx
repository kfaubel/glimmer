//import React from 'react';
import dateFormat from "dateformat";

export interface TimeBugProps {
    timeBug: string;
}

function TimeBug(props: TimeBugProps) {
    const now = new Date();
    const timeStr = dateFormat(now, "h:MM TT");
    console.log("TimeBug");
    switch (props.timeBug) {
        case "lower-right-light":
            return (
            <div
                id="time-bug"
                className="time-bug time-bug-lower-right-light">
                {timeStr}
            </div>
            );
        case "lower-right-dark":
            return (
            <div
                id="time-bug"
                className="time-bug time-bug-lower-right-dark">
                {timeStr}
            </div>
            );
        case "upper-right-light":
            return (
            <div
                id="time-bug"
                className="time-bug time-bug-upper-right-light">
                {timeStr}
            </div>
            );
        case "upper-right-dark":
            return (
            <div
                id="time-bug"
                className="time-bug time-bug-upper-right-dark">
                {timeStr}
            </div>
            );
        default:
            return(null);
    }
}

export default TimeBug;