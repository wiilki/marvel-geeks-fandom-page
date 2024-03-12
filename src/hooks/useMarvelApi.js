import { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const useMarvelApi = (query, customUrl = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query && !customUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const publicKey = process.env.REACT_APP_MARVEL_PUBLIC_KEY;
        const privateKey = process.env.REACT_APP_MARVEL_PRIVATE_KEY;
        const ts = new Date().getTime();
        const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();

        const url = customUrl || `https://gateway.marvel.com:443/v1/public/characters`;

        const params = customUrl
          ? { apikey: publicKey, ts, hash }
          : { apikey: publicKey, ts, hash, nameStartsWith: query };

        const response = await axios.get(url, { params });

        // Apply convertUrlsToHttps to each result to ensure all URLs use HTTPS
        const modifiedResults = response.data.data.results.map(convertUrlsToHttps);

        setData(modifiedResults);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, customUrl]);

  return { data, loading, error };
};

export default useMarvelApi;

// Utility function to convert URLs within an object from HTTP to HTTPS
function convertUrlsToHttps(item) {
  for (let key in item) {
    if (typeof item[key] === 'object') {
      convertUrlsToHttps(item[key]);
    } else if (typeof item[key] === 'string' && item[key].startsWith('http://')) {
      item[key] = item[key].replace('http://', 'https://');
    }
  }
  return item;
}
