import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { BASE_URL, API_KEY, useMovies } from "./hooks/useMovies";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useKey } from "./hooks/useKey";

const APP_TITLE = "usePopcorn";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
    // ❓When `useState` hook is executed?
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const { movies, isLoading, error } = useMovies(query);

    // const [watched, setWatched] = useState([]);
    // ❗↓ Do NOT set state in this way. This code will be executed on every render.
    // setWatched(JSON.parse(localStorage.getItem("watched")));
    // ❗↓ When the initial value of useState depends on some computation, we should always pass the value in a callback function (lazy evaluation). This callback must be pure and accept no arguments.
    const [watched, setWatched] = useLocalStorageState("watched", []);

    // const [watched, setWatched] = useState(() => {
    //     const stored = localStorage.getItem("watched");
    //     return JSON.parse(stored);
    // });

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? "" : id));
    }

    function handleCloseMovieDetails() {
        setSelectedId("");
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    return (
        <>
            <NavBar>
                <Search
                    query={query}
                    setQuery={setQuery}
                />
                <NumResults movies={movies} />
            </NavBar>

            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>
                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            watched={watched}
                            onCloseMovieDetails={handleCloseMovieDetails}
                            onAddWatched={handleAddWatched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMovieList
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
    return (
        <p className="error">
            <span>💥</span>
            {message}
        </p>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function Search({ query, setQuery }) {
    // useEffect(function () {
    // ❗Manually Selecting a DOM element is NOT really a React way
    // ❗Instead, use `useRef`.
    // const el = document.querySelector('.search');
    // el.focus();
    // }, []);

    const inputEl = useRef(null);

    useKey("Enter", () => {
        if (document.activeElement === inputEl.current) return;

        inputEl.current.focus();
        setQuery("");
    });

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function NumResults({ movies }) {
    return (
        <div className="num-results">
            <p>
                Showing <strong>{movies.length}</strong> results
            </p>
        </div>
    );
}

function NavBar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img
                src={movie.Poster}
                alt={`${movie.Title} poster`}
            />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function MovieDetails({
    selectedId,
    watched,
    onCloseMovieDetails,
    onAddWatched,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState(0);
    const isWatched = watched.find((movie) => movie.imdbID === selectedId);

    useKey("Escape", onCloseMovieDetails);

    const countRef = useRef(0);

    useEffect(() => {
        if (userRating) countRef.current++;
    }, [userRating]);

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: runtime.split(" ").at(0),
            userRating,
            countRatingDecision: countRef.current,
        };
        onAddWatched(newWatchedMovie);
        onCloseMovieDetails();
    }

    useEffect(
        function () {
            const params = {
                apiKey: API_KEY,
                i: selectedId,
            };
            const searchParams = new URLSearchParams(params);
            const url = `${BASE_URL}?${searchParams.toString()}`;

            async function getMovieDetail() {
                setIsLoading(true);
                const res = await fetch(url);
                if (!res.ok) throw new Error();

                const data = await res.json();

                setMovie(data);
                setIsLoading(false);
            }
            getMovieDetail();
        },
        [selectedId]
    );

    useEffect(() => {
        if (!title) return;
        document.title = `MOVIE | ${title}`;

        return () => {
            document.title = APP_TITLE;
        };
    }, [title]);

    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button
                            className="btn-back"
                            onClick={onCloseMovieDetails}
                        >
                            &larr;
                        </button>
                        <img
                            src={poster}
                            alt={`'${title}' poster`}
                        />
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span></span>
                                {imdbRating} IMDB rating
                            </p>
                        </div>
                    </header>

                    <section>
                        <div className="rating">
                            {isWatched ? (
                                <p>
                                    You rated with movie {isWatched.userRating}
                                    <span>⭐</span>
                                </p>
                            ) : (
                                <>
                                    <StarRating
                                        maxRating={10}
                                        size={24}
                                        onSetRating={setUserRating}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handleAdd}
                                        >
                                            + Add to list
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}

function MovieList({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    key={movie.imdbID}
                    movie={movie}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMovie({ movie, onDeleteWatched }) {
    return (
        <li>
            <img
                src={movie.poster}
                alt={`${movie.title} poster`}
            />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button
                    className="btn-delete"
                    onClick={() => onDeleteWatched(movie.imdbID)}
                >
                    X
                </button>
            </div>
        </li>
    );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie
                    key={movie.imdbID}
                    movie={movie}
                    onDeleteWatched={onDeleteWatched}
                />
            ))}
        </ul>
    );
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}

// function ListBox({ children }) {
//   const [isOpen1, setIsOpen1] = useState(true);

//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen1((open) => !open)}>
//         {isOpen1 ? "–" : "+"}
//       </button>
//       {isOpen1 && children}
//     </div>
//   );
// }

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen2((open) => !open)}>
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function Main({ children }) {
    return <main className="main">{children}</main>;
}
