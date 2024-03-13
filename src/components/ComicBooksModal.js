import React, { useState, useEffect } from 'react';
import { notAvailableImage } from '../utils/constants'; 
import '../styles/comicbooksmodal.css';

const ComicBooksModal = ({ isOpen, onClose, comics, character }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComics = async () => {
      try {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to load comics:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      setIsLoading(true);
      loadComics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const comicsToDisplay = comics.filter(comic => {
    const comicImageUrl = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    return comicImageUrl !== notAvailableImage;
  });

  return (
    <div className="comic-books-modal-overlay" onClick={onClose}>
      <div className="comic-books-modal-content" onClick={e => e.stopPropagation()}>
        {isLoading ? (
          <p>Loading comics...</p>
        ) : comicsToDisplay.length > 0 ? (
          <ul className="comic-grid-container">
            {comicsToDisplay.map(comic => (
              <li key={comic.id}>
                <div className='comic-book-card'>
                  <img src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`} alt={comic.title} style={{ width: '100%', height: 'auto' }} />
                  <h4>{comic.title}</h4>
                  <p>{comic.description}</p>
                  <a href={comic.urls[0].url} target="_blank" rel="noopener noreferrer">More Info</a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comics available for this character.</p>
        )}
        {!isLoading && (
          <div className="close-button-container">
            <button className='close-modal-button' onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicBooksModal;