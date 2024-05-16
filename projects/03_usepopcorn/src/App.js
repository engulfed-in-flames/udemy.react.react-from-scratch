import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// If you declare variables inside a component, they will be reinitialized every time the component re-renders.
const APP_TITLE = "usePopcorn";
const BASE_URL = `http://www.omdbapi.com/`;
const API_KEY = "2e845a60";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState("");

    // ❌ NEVER be allowed in render logic. Infinite loop of fetching and updating state happens.
    // fetch(url)
    //     .then((res) => res.json())
    //     .then((data) => console.log(data));

    // Executed after the first render (mount) and every time the component re-renders. (Triggered by rendering)

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? "" : id));
    }

    function handleCloseMovieDetails() {
        setSelectedId("");
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    useEffect(() => {
        // Always cleanup the previous effect before running the next effect.
        const controller = new AbortController();

        async function fetchMovies() {
            const url = `${BASE_URL}?apiKey=${API_KEY}&s=${query}`;

            try {
                setIsLoading(true);
                setError("");

                // fetch will throw an error when the request is aborted.
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error("Failed to fetch movies");

                const data = await res.json();
                if (data.Response === "False") throw new Error(data.Error);

                setMovies(data.Search);
                setError("");
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.log(err.message);
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if (query.length < 3) {
            setMovies([]);
            setError("");
            return;
        }

        handleCloseMovieDetails();
        fetchMovies();

        return () => {
            controller.abort();
        };
    }, [query]);

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
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        };
        onAddWatched(newWatchedMovie);
        onCloseMovieDetails();
    }

    // One useEffect for one side effect.
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
                // After setting state, the component will re-render.
                setMovie(data);
                setIsLoading(false);
            }
            getMovieDetail();
        },
        [selectedId]
    );

    useEffect(() => {
        // Definitely side effect
        if (!title) return;
        document.title = `MOVIE | ${title}`;

        return () => {
            document.title = APP_TITLE;
        };
    }, [title]);

    useEffect(() => {
        function callback(e) {
            if (e.key === "Escape") {
                onCloseMovieDetails();
            }
        }
        // If we open movie details 10 times without cleanup, we will have 10 event listeners.
        document.addEventListener("keydown", callback);

        return () => {
            document.removeEventListener("keydown", callback);
        };
    }, [onCloseMovieDetails]);

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
