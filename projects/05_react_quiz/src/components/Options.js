import React from "react";

export default function Options({ question, answer, dispatch }) {
    const { options, correctOption } = question;
    const hasAnswered = answer !== null;

    return (
        <div className="options">
            {options.map((option, index) => (
                <button
                    className={`btn btn-option ${
                        index === answer ? "answer" : ""
                    } ${
                        hasAnswered
                            ? index === correctOption
                                ? "correct"
                                : "wrong"
                            : ""
                    }`}
                    key={index}
                    disabled={answer !== null}
                    onClick={() =>
                        dispatch({ type: "NEW_ANSWER", payload: index })
                    }
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
