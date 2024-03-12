import React, { useState } from 'react';
import useMarvelApi from '../hooks/useMarvelApi';
import useIMDBData from '../hooks/useIMDBData';
import Comic from '../components/Comic';
// import Movies from '../components/Movies';
import '../styles/searchPage.css';

function Search() {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useMarvelApi(query);

  useIMDBData('hulk');


  return (
    <section id="search-section">
      <h1>Search Marvel Characters</h1>
      <input
        type="text"
        placeholder="Enter character name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* <Movies /> */}

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      <h2>Versions of Hero</h2>
      {data && <Comic characters={data} />}
    </section>
  );
}

export default Search;
