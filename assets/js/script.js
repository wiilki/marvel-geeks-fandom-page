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
    // Iterates through first level of arrays
    for (j = 0; j < charactersArray.length; j++) {
        var newArray = charactersArray[j];
        // Iterates through second level of arrays
        for (k = 0; k < newArray.length; k++) {
            var charName = newArray[k].name;
            var charExt = newArray[k].thumbnail.extension;
            var charPath = newArray[k].thumbnail.path;

            // If value of input equals a character's name in the array
            if (charName.toUpperCase() === character.toUpperCase()) {
                characterData.ext = charExt;
                characterData.path = charPath;
                characterDisplayEl.innerHTML = "<h1 class='character-name'>" + charName + "</h1>";
            };
        };
    };
    var fileExt = characterData.ext;
    var pathUrl = characterData.path;
    appendPhoto(fileExt, pathUrl)
};

function appendPhoto(fileExt, pathUrl) {

    // Create new api for hero photo
    var thumbnailApi = pathUrl + '/portrait_xlarge.' + fileExt;
    // Create dynamic <img>
    var photo = document.createElement('img');
    photo.src = thumbnailApi;
    photo.classList.add("hero-image")

    // Render hero image to page
    characterDisplayEl.appendChild(photo);

}

searchFormEl.addEventListener('submit', formSubmitHandler);