import { useState, useEffect } from 'react';

export const useIMDBData = (characterAPI) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const imdbKey = process.env.REACT_APP_IMDB_KEY;

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': imdbKey,
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(`https://movie-database-alternative.p.rapidapi.com/?s=${encodeURIComponent(characterAPI)}&r=json&page=1`, options);
        const searchData = await response.json();
        
        // Filter the search results to only include titles that contain the search query exactly as entered
        const filteredResults = searchData.Search?.filter(movie => 
          movie.Title.toLowerCase().includes(characterAPI.toLowerCase())
        ) || [];

        setSearchResults(filteredResults);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [characterAPI, imdbKey]);

  return { searchResults, loading, error };
};

export const useIMDBMovieDetails = (imdbID) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const imdbKey = process.env.REACT_APP_IMDB_KEY;

  useEffect(() => {
    if (!imdbID) return;

    setLoading(true);
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': imdbKey,
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(`https://movie-database-alternative.p.rapidapi.com/?i=${imdbID}&r=json`, options);
        const movieData = await response.json();
        setMovieDetails(movieData);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [imdbID, imdbKey]);

  return { movieDetails, loading, error };
};