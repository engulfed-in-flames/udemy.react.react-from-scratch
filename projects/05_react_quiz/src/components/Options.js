import React from "react";

export default function Options({ options }) {
    return (
        <div className="options">
            {options.map((option, index) => (
                <button
                    key={index}
                    className="btn btn-option"
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
