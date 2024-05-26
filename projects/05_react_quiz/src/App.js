// import DateCounter from "./DateCounter";

import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishScreen from "./components/FinishScreen";
import Footer from "./components/Footer";
import Timer from "./components/Timer";

const SECS_PER_QUESTION = 30;
const PORT = 8000;
const url = `http://localhost:${PORT}/questions`;

const initialState = {
    questions: [],

    //  'loading', 'error', 'ready', 'active', 'finished'
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highScore: 0,
    secondsRemaining: 0,
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
                secondsRemaining: state.questions.length * SECS_PER_QUESTION,
            };
        case "NEW_ANSWER":
            const { questions, index, points } = state;
            const question = questions.at(index);

            return {
                ...state,
                answer: payload,
                points:
                    payload === question.correctOption
                        ? points + question.points
                        : points,
            };
        case "NEXT_QUESTION":
            return {
                ...state,
                index: state.index + 1,
                answer: null,
            };
        case "FINISH":
            return {
                ...state,
                status: "finished",
                answer: null,
                highScore:
                    state.points > state.highScore
                        ? state.points
                        : state.highScore,
            };
        case "RESTART":
            return {
                ...initialState,
                questions: state.questions,
                status: "ready",
            };
        case "TICK": {
            return {
                ...state,
                secondsRemaining: state.secondsRemaining - 1,
                status:
                    state.secondsRemaining === 1 ? "finished" : state.status,
            };
        }
        default:
            throw new Error(`Unsupported action type: ${typeUpperCase}`);
    }
};

export default function App() {
    const [
        {
            questions,
            status,
            index,
            answer,
            points,
            highScore,
            secondsRemaining,
        },
        dispatch,
    ] = useReducer(reducer, initialState);

    const numQuestions = questions.length;
    const maxTotalPoints = questions.reduce(
        (totalPoints, question) => totalPoints + question.points,
        0
    );

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
                    <>
                        <Progress
                            index={index}
                            answer={answer}
                            numQuestions={numQuestions}
                            points={points}
                            maxTotalPoints={maxTotalPoints}
                        />
                        <Question
                            question={questions[index]}
                            dispatch={dispatch}
                            answer={answer}
                        />
                        <Footer>
                            <Timer
                                dispatch={dispatch}
                                secondsRemaining={secondsRemaining}
                            />
                            <NextButton
                                index={index}
                                numQuestions={numQuestions}
                                answer={answer}
                                dispatch={dispatch}
                            />
                        </Footer>
                    </>
                )}
                {status === "finished" && (
                    <FinishScreen
                        points={points}
                        maxTotalPoints={maxTotalPoints}
                        highScore={highScore}
                        dispatch={() => dispatch({ type: "RESTART" })}
                    />
                )}
            </Main>
            {/* <DateCounter /> */}
        </div>
    );
}
