const useIMDBData = (characterAPI) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      setLoading(true);
      const fetchData = async () => {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'c283f784f4msh9f1b5e27819ca63p1488ccjsne3a8170d557f',
            'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
          }
        };
  
        try {
          const response = await fetch(`https://movie-database-alternative.p.rapidapi.com/?s=${characterAPI}&r=json&page=1`, options);
          const searchData = await response.json();
          setSearchResults(searchData.Search || []); // Adjust based on actual API response structure
        } catch (error) {
          console.error(error);
          setError(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [characterAPI]);
  
    return { searchResults, loading, error };
  };
  