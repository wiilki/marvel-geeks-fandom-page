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

    var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&name=' + character + '&apikey=5c7c9b1197b1acab4c35914e52e3d2de&hash=1b4af5cb2f24c39efbb7806237705b95&';

    fetch(marvelApiUrl)
        .then(function (response) {
            if (response.status === 200)
            {
                // console.log(response.json());
                console.log(response.status)
                response.json().then(function (responseJN) {
                    // grab data
                    var dataPolled = responseJN.data.results
                    if (dataPolled[0])
                    {
                        console.log(dataPolled)
                        // dynamically update the name on site
                        characterDisplayEl.innerHTML = "<h1 class='character-name'>" + dataPolled[0].name + "</h1>";
                        // append the thumbnail photo TODO: instead use a better image, currently distorted 
                        appendPhoto(dataPolled[0].thumbnail.extension, dataPolled[0].thumbnail.path)
                    }
                    else{
                        characterDisplayEl.innerHTML = "<h1 class='character-description'>" + "No Data for " + character  + "</h1>";

                    }
                    
                })
            }
            else 
            {
                alert("Error when polling http request!")
            }
            
    });
    // manually seaches through each array in our dictionary (very inefficient)
    // for (j = 0; j < charactersArray[0].length; j++) {
    //     var newArray = charactersArray[0][j];
    //     // Iterates through second level of arrays
    //     for (k = 0; k < newArray.length; k++) {
    //         var charName = newArray[k].name;
    //         var charExt = newArray[k].thumbnail.extension;
    //         var charPath = newArray[k].thumbnail.path;

    //         // If value of input equals a character's name in the array
    //         if (charName.toUpperCase() === character.toUpperCase()) {
    //             characterData.ext = charExt;
    //             characterData.path = charPath;
    //             characterDisplayEl.innerHTML = "<h1 class='character-name'>" + charName + "</h1>";
    //         };
    //     };
    // };
    // var fileExt = characterData.ext;
    // var pathUrl = characterData.path;
    // appendPhoto(fileExt, pathUrl)
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