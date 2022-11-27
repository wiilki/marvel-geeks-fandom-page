// document query selectors
var characterInputEl = document.querySelector('#search-box');
var searchFormEl = document.querySelector('#search-form');

// Even handler for new character search
var formSubmitHandler = function (event) {
    event.preventDefault();
    var characterName = characterInputEl.value.trim();
    // redirect to another page that displays the results
    if (characterName) {
        getResponse(characterName)
        characterInputEl.value = '';
    } else {
        alert("Cannot be blank");
    };
};


var getResponse = (character) =>
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
                        // relocate the next html page
                        window.location.href='results.html?character=' + characterName + "?img-link=" + imgLink + "?img-ext=" + imgExt;
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

// button click handler
searchFormEl.addEventListener('submit', formSubmitHandler);