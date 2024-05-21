import React from "react";
import Options from "./Options";

export default function Question({ question }) {
    const { question: text, options } = question;
    return (
        <div>
            <h4>{text}</h4>

            <Options options={options} />
        </div>
    );
}
