import React, { useState, useEffect } from 'react';
import ComicBooksModal from './ComicBooksModal';
import '../styles/searchPage.css';
import useMarvelApi from '../hooks/useMarvelApi'; // Import the hook

function Comic({ characters }) {
  const [isComicBooksModalOpen, setIsComicBooksModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [comics, setComics] = useState([]);
  const notAvailableImage = "https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";

  // Use the custom hook
  const { data: characterData } = useMarvelApi(null, selectedCharacter?.comics.collectionURI);

  useEffect(() => {
    if (characterData) {
      setComics(characterData);
    }
  }, [characterData]);

  const handleCharacterClick = character => {
    setSelectedCharacter(character);
    setIsComicBooksModalOpen(true);
  };

  return (
    <div className="comic-book-content">
      {characters.map((character) => {
        const characterImageUrl = `${character.thumbnail.path}.${character.thumbnail.extension}`;
        if (characterImageUrl === notAvailableImage) return null;

        return (
          <div key={character.id} className='character-card' onClick={() => handleCharacterClick(character)}>
            <h3>{character.name}</h3>
            <img src={characterImageUrl} alt={character.name} />
          </div>
        );
      })}

      <ComicBooksModal isOpen={isComicBooksModalOpen} onClose={() => setIsComicBooksModalOpen(false)} comics={comics} character={selectedCharacter}>
        {/* Placeholder content for now; you can include anything about the selectedCharacter */}
        <h2>{selectedCharacter?.name}</h2>
        <p>{selectedCharacter?.description}</p>
      </ComicBooksModal>
    </div>
  );
}

export default Comic;
