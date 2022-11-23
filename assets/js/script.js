var characterInputEl = document.querySelector('#search-box');
var searchButton = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form');
var characterDisplayEl = document.querySelector('#character-photo');
var charactersArray = [];
var characterData = {
    ext: '',
    path: ''
}


// Even handler for new character search
var formSubmitHandler = function (event) {
    event.preventDefault();
    var characterName = characterInputEl.value.trim();
    // Blank error message
    if (characterName) {
        getCharData(characterName);
        // Clear input box
        characterInputEl.value = '';
    } else {
        alert("Cannot be blank");
    };
};

// Match user input to characters name in array
function getCharData(character) {

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
                        // dynamically update the name on site
                        characterDisplayEl.innerHTML = "<h1 class='character-name'>" + dataPolled[0].name + "</h1>";
                        // append the thumbnail photo 
                        // TODO: instead use a better image, currently distorted 
                        appendPhoto(dataPolled[0].thumbnail.extension, dataPolled[0].thumbnail.path)
                    }
                    // handle limited data case
                    else
                    {
                        characterDisplayEl.innerHTML = "<h1 class='character-description'>" + "No Data for " + character  + "</h1>";

                    }
                    
                })
            }
            // invalid response
            else 
            {
                alert("Error when polling http request!")
            }
            
    });
};

function appendPhoto(fileExt, pathUrl) {
    // Create new api for hero photo
    var thumbnailApi = pathUrl + '/portrait_xlarge.' + fileExt;
    // Create dynamic <img>
    var photo = document.createElement('img');
    photo.innerHTML = '';
    photo.src = thumbnailApi;
    photo.classList.add("hero-image")

    // Render hero image to page
    characterDisplayEl.appendChild(photo);
}


searchFormEl.addEventListener('submit', formSubmitHandler);