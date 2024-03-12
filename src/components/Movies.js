import React from 'react';
import useIMDBData from '../hooks/useIMDBData';

const Movies = ({ characterAPI }) => {
    const { searchResults, loading, error } = useIMDBData(characterAPI);

   if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!searchResults || searchResults.length === 0) return null;

    return (
        <>
            <div className="character-content">

            {searchResults.map((movie) => (
                <div key={movie.imdbID} className="character-card">
                    <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                    <div>
                        <h3>{movie.Title}</h3>
                        <p><strong>Year:</strong> {movie.Year}</p>
                        <p><strong>Type:</strong> {movie.Type}</p>
                    </div>
                </div>
            ))}
            </div>
        </>
    );
};

export default Movies;
