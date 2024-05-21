// import DateCounter from "./DateCounter";

import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./StartScreen";
import Question from "./components/Question";

const PORT = 8000;
const url = `http://localhost:${PORT}/questions`;

const initialState = {
    questions: [],

    //  'loading', 'error', 'ready', 'active', 'finished'
    status: "loading",
    index: 0,
};

const reducer = (state, action) => {
    const { type, payload } = action;
    const typeUpperCase = type.toUpperCase();

    switch (typeUpperCase) {
        case "DATA_RECEIVED":
            return {
                ...state,
                questions: payload,
                status: "ready",
            };
        case "DATA_FAILED":
            return {
                ...state,
                status: "error",
            };
        case "START":
            return {
                ...state,
                status: "active",
            };
        default:
            throw new Error(`Unsupported action type: ${typeUpperCase}`);
    }
};

export default function App() {
    const [{ questions, status, index }, dispatch] = useReducer(
        reducer,
        initialState
    );

    const numQuestions = questions.length;

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => dispatch({ type: "DATA_RECEIVED", payload: data }))
            .catch((err) => dispatch({ type: "DATA_FAILED" }));
    }, []);
    return (
        <div className="app">
            <Header />

            <Main>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && (
                    <StartScreen
                        numQuestions={numQuestions}
                        dispatch={() => dispatch({ type: "START" })}
                    />
                )}
                {status === "active" && (
                    <Question question={questions[index]} />
                )}
            </Main>
            {/* <DateCounter /> */}
        </div>
    );
}
