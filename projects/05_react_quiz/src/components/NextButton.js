import React from "react";

export default function NextButton({ index, numQuestions, answer, dispatch }) {
    if (answer === null) return null;

    const btnText = index < numQuestions - 1 ? "Next" : "Finish";
    const actionType = index < numQuestions - 1 ? "NEXT_QUESTION" : "FINISH";

    return (
        <button
            className="btn btn-ui"
            onClick={() => dispatch({ type: actionType })}
        >
            {btnText}
        </button>
    );
}
