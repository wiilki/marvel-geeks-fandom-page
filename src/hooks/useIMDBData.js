import { useState, useEffect } from 'react';

const useIMDBData = (characterAPI) => {
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
        const response = await fetch(`https://movie-database-alternative.p.rapidapi.com/?s=${characterAPI}&r=json&page=1`, options);
        const searchData = await response.json();
        setSearchResults(searchData.Search || []);
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


export default useIMDBData;
