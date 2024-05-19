import { useState, useEffect } from "react";

export const BASE_URL = `http://www.omdbapi.com/`;
export const API_KEY = "2e845a60";

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // callback?.();

        const controller = new AbortController();

        async function fetchMovies(query) {
            const url = `${BASE_URL}?apiKey=${API_KEY}&s=${query}`;

            try {
                setIsLoading(true);
                setError("");

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

        fetchMovies();

        return () => {
            controller.abort();
        };
    }, [query]);

    return { movies, isLoading, error };
}
