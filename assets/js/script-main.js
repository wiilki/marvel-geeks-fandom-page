// document query selectors
var characterInputEl = document.querySelector('#search-box');
var searchFormEl = document.querySelector('#search-form');

// Even handler for new character search
var formSubmitHandler = function (event) {
    event.preventDefault();
    var characterName = characterInputEl.value.trim();
    // redirect to another page that displays the results
    if (characterName) {
        processRequests(characterName)
        characterInputEl.value = '';
    } else {
        alert("Cannot be blank");
    };
};


var processRequests = (character) =>
{
    // GET Request endpoint
    var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&name=' + character + '&apikey=' + config.PUBLIC_KEY + '&hash=' + config.HASH_KEY +'&';
    // perform GET request
    fetch(marvelApiUrl)
        .then(function (response) {
            // verify if response is valid
            if (response.status === 200)
            {
                // process the response with promise 
                response.json().then(function (responseJN) {
                    // grab data from promise
                    var dataPolled = responseJN.data.results;
                    // verify that data we received is in the database (spiderman is not 100% owned by marvel, hence limited data)
                    if (dataPolled[0])
                    {
                        // grab api name of character
                        var characterName = dataPolled[0].name
                        // grab api path to thumbnail
                        var imgLink = dataPolled[0].thumbnail.path
                        // grab extension of api
                        var imgExt = dataPolled[0].thumbnail.extension
                        // call IMDb api
                        findIMDBID(characterName)
                    }
                    else
                    {
                        alert("Not a Marvel Character!")
                    }
                })
            }
            // invalid response
            else 
            {
                alert("Error when polling http request!")
            }
            
    });
}

var findIMDBID = (characterAPI) =>
{
    // search name in API
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': config.RAPID_KEY,
            'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
    };
    
    fetch('https://movie-database-alternative.p.rapidapi.com/?s=' + characterAPI + '&r=json&page=1', options)
        .then(response => response.json())
        .then(response =>
        {   
            // find the matching imdb link
            response.Search.forEach(element => {
                if (element.Title === characterAPI)
                {
                    // get needed data from imdbID
                    getIMDBResponse(element.imdbID, characterAPI)
                }
            });
        })
        .catch(err => console.error(err));

}

var getIMDBResponse = (imdbID, characterAPI) =>
{
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': config.RAPID_KEY,
            'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
    };
    
    fetch('https://movie-database-alternative.p.rapidapi.com/?r=json&i=' + imdbID, options)
        .then(response => response.json())
        .then(response => {
            // grab data to pass as query parameters to front end
            var characterName = characterAPI;
            var poster = response.Poster
            var rottenTomatoesScore = response.Ratings[1].Value
            var plot = response.Plot
            var releaseDate = response.Released
            var rated = response.Rated

            // pass query parameters to the new html page
            window.location.href='results.html?character=' + characterName + "?img-link=" + poster + "?rottenTomatoesScore=" + rottenTomatoesScore +"?plot="+plot +
                "?releaseDate=" + releaseDate + "?rated=" + rated;

        })
        .catch(err => console.error(err));
}

// button click handler
searchFormEl.addEventListener('submit', formSubmitHandler);