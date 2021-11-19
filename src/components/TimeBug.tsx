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
            <button
                id="time-bug"
                className="float-time-bug-lower-right-light">
                {timeStr}
            </button>
            );
        case "lower-right-dark":
            return (
            <button
                id="time-bug"
                className="float-time-bug-lower-right">
                {timeStr}
            </button>
            );
            case "upper-right-light":
                return (
                <button
                    id="time-bug"
                    className="float-time-bug-upper-right-light">
                    {timeStr}
                </button>
                );
            case "upper-right-dark":
                return (
                <button
                    id="time-bug"
                    className="float-time-bug-upper-right-dark">
                    {timeStr}
                </button>
                );
        default:
            return(null);
    }
}

export default TimeBug;