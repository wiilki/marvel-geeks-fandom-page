import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComicBooksModal from './ComicBooksModal'; 
import '../styles/searchPage.css';
import CryptoJS from 'crypto-js';

function Comic({ characters }) {
  const [isComicBooksModalOpen, setIsComicBooksModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [comics, setComics] = useState([]);
  const notAvailableImage = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";

  useEffect(() => {
    const fetchComics = async () => {
      if (!selectedCharacter) return;

      const publicKey = process.env.REACT_APP_MARVEL_PUBLIC_KEY;
      const privateKey = process.env.REACT_APP_MARVEL_PRIVATE_KEY;
      const ts = new Date().getTime();
      const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();

      try {
        const response = await axios.get(`${selectedCharacter.comics.collectionURI}`, {
          params: {
            ts,
            apikey: publicKey,
            hash,
          },
        });
        setComics(response.data.data.results);
      } catch (error) {
        console.log(error);
      }
    };

    fetchComics();
  }, [selectedCharacter]);

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
