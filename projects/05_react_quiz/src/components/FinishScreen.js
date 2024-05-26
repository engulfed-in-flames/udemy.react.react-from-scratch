import React from "react";

export default function FinishScreen({
    points,
    maxTotalPoints,
    highScore,
    dispatch,
}) {
    const percentage = (points / maxTotalPoints) * 100;

    let emoji;

    if (percentage === 100) emoji = "🥳";
    if (percentage >= 80 && percentage < 100) emoji = "😎";
    if (percentage >= 60 && percentage < 80) emoji = "😊";
    if (percentage >= 40 && percentage < 60) emoji = "😐";
    if (percentage < 40) emoji = "😬";

    return (
        <>
            <p className="result">
                <span>{emoji}</span>You scored <strong>{points}</strong> out of{" "}
                {maxTotalPoints} ({Math.ceil(percentage)}%)
            </p>
            <p className="highscore">{`High score: ${highScore} points`}</p>
            <button
                className="btn btn-ui"
                onClick={dispatch}
            >
                Restart Quiz
            </button>
        </>
    );
}
