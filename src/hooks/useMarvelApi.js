import { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const useMarvelApi = (query, customUrl = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If neither query nor customUrl is provided, exit early.
    if (!query && !customUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const publicKey = process.env.REACT_APP_MARVEL_PUBLIC_KEY;
        const privateKey = process.env.REACT_APP_MARVEL_PRIVATE_KEY;
        const ts = new Date().getTime();
        const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();

        // Determine the URL based on the provided parameters.
        const url = customUrl || `https://gateway.marvel.com:443/v1/public/characters`;

        const params = customUrl
          ? { apikey: publicKey, ts, hash } // For customUrl, basic params are needed.
          : { apikey: publicKey, ts, hash, nameStartsWith: query }; // For character search, include the query.

        const response = await axios.get(url, { params });

        setData(response.data.data.results);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, customUrl]); // Include customUrl in the dependencies array

  return { data, loading, error };
};

export default useMarvelApi;
