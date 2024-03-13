import React, { useState } from 'react';
import { useIMDBData, useIMDBMovieDetails } from '../hooks/useIMDBData';
import MovieModal from './movieModal';

const Movies = ({ characterAPI }) => {
    const { searchResults, loading, error } = useIMDBData(characterAPI);
    const [selectedIMDBID, setSelectedIMDBID] = useState(null);
    const { movieDetails, loading: detailsLoading, error: detailsError } = useIMDBMovieDetails(selectedIMDBID);

    const openModal = (imdbID) => {
        setSelectedIMDBID(imdbID);
    };

    const closeModal = () => {
        setSelectedIMDBID(null);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!searchResults || searchResults.length === 0) return null;

    return (
        <>
            <div className="character-content">
                {searchResults.map((movie) => (
                    <div key={movie.imdbID} className="character-card" onClick={() => openModal(movie.imdbID)}>
                        <div>
                            <h3>{movie.Title}</h3>
                            <p><strong>Year:</strong> {movie.Year}</p>
                        </div>
                        <img src={movie.Poster} alt={`${movie.Title} Poster`} />

                    </div>
                ))}
            </div>
            {selectedIMDBID && <MovieModal movie={movieDetails} onClose={closeModal} loading={detailsLoading} error={detailsError} />}
        </>
    );
};

export default Movies;
