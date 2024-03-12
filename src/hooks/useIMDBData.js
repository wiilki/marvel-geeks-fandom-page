import { useEffect } from 'react';

const useIMDBData = (characterAPI) => {
  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '534da45c91msh1a199e3ff62abfdp1fed85jsn600cca5f4482',
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(`https://movie-database-alternative.p.rapidapi.com/?s=${characterAPI}&r=json&page=1`, options);
        const searchData = await response.json();
        const imdbID = searchData?.Search?.find(element => element.Title === characterAPI)?.imdbID;
        if (imdbID) {
          const imdbResponse = await fetch(`https://movie-database-alternative.p.rapidapi.com/?r=json&i=${imdbID}`, options);
          const movieData = await imdbResponse.json();
          const { Poster, Ratings, Plot, Released, Rated } = movieData;
          const rottenTomatoesScore = Ratings[1]?.Value;
          const queryParams = new URLSearchParams({
            character: characterAPI,
            'img-link': Poster,
            'rottenTomatoesScore': rottenTomatoesScore,
            'plot': Plot,
            'releaseDate': Released,
            'rated': Rated
          });
          window.location.href = `results.html?${queryParams.toString()}`;
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [characterAPI]);
};

export default useIMDBData;
