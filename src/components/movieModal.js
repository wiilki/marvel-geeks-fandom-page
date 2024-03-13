import React from 'react';
import '../styles/moviemodal.css'

const MovieModal = ({ movie, onClose, loading, error }) => {
    // Optional: Handle loading and error states if passed as props
    if (loading) return <div>Loading movie details...</div>;
    if (error) return <div>Error fetching movie details: {error.message}</div>;

    if (!movie) return null;

    // Display the detailed information fetched
    return (
        <div className="modal-backdrop">
            <div className="modal-content">

                <div className='movie-card'>
                    <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                    <h3>{movie.Title}</h3>
                    <p><strong>Plot:</strong> {movie.Plot}</p>
                    <p><strong>Year:</strong> {movie.Year}</p>
                    <p><strong>Rated:</strong> {movie.Rated}</p>
                    <p><strong>Released:</strong> {movie.Released}</p>
                    <p><strong>Genre:</strong> {movie.Genre}</p>
                    <p><strong>Director:</strong> {movie.Director}</p>

                    {movie.Ratings && movie.Ratings.map((rating, index) => (
                        <p key={index}><strong>{rating.Source}:</strong> {rating.Value}</p>
                    ))}
                    <p><strong>Actors:</strong> {movie.Actors}</p>
               
                    <p><strong>Writer:</strong> {movie.Writer}</p>

                </div>
                <div className="close-button-container">
                    <button className='close-modal-button' onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default MovieModal;
