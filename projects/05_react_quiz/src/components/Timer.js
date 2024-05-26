import React, { useEffect } from "react";

export default function Timer({ dispatch, secondsRemaining }) {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = Math.floor(secondsRemaining % 60);
    const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

    useEffect(() => {
        // This cause performance issue in large-scale application because of re-rendering every components.
        // However, in this case, it is not such a big deal.
        const id = setInterval(() => {
            dispatch({ type: "tick" });
        }, 1000);
        return () => clearInterval(id);
    }, [dispatch]);

    return <div className="timer">{formattedTime}</div>;
}
