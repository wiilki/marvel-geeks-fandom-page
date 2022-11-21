var characterInputEl = document.querySelector('#search-box');    
var searchButton = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form')
    
    // Even handler for new character search
    var formSubmitHandler = function (event) {
        event.preventDefault();
        var characterName = characterInputEl.value.trim();
        // Blank error message
        if (characterName) {
           console.log(characterName)
            // Clear input box
            characterInputEl.value = '';
        } else {
            alert("Cannot be blank");
        };
    };

    var getCharData = function (char) {
        // Call api by char name first
        var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362';

        // Fetch Marvel Data
        fetch(marvelApiUrl)
            .then(function (response) {
                // Error if response cannot find char
                if (response.ok) {
                    // Parse info from api
                    console.log(response.json())
                    // .then(function (data) {
                    //     getCharData(data, char);
                    // })
                } else {
                    alert("Check your spelling");
                }
            }).catch(function (error) {
                alert("Unable to connect");
            });
    };
    
    
    searchFormEl.addEventListener('submit', formSubmitHandler);