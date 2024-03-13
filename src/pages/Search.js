import React, { useState } from 'react';
import useMarvelApi from '../hooks/useMarvelApi';
import Comic from '../components/Comic';
import Movies from '../components/Movies';
import '../styles/searchPage.css';

function Search() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useMarvelApi(query);

  return (
    <section id="search-section">
      <h1>Search Marvel Characters</h1>
      <input
        type="text"
        placeholder="Enter character name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Render Comics */}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {query && data && data.length > 0 && <h2>Visual Media</h2>}
      {data && <Comic characters={data} />}
      {/* Render Movies */}
      {query && <h2>Cinematic</h2>}
      {query && <Movies characterAPI={query} />}
    </section>
  );
}

export default Search;
