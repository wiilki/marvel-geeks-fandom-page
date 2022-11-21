var characterInputEl = document.querySelector('#search-box');
var searchButton = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form');
var characterDisplayEl = document.querySelector('#character-photo');
var characterArray = [];


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
    for (j = 0; j < characterArray.length; j++) {
        var newArray = characterArray[j];
        // Iterates through second level of arrays
        for (k = 0; k < newArray.length; k++) {
            var charName = newArray[k].name;
            // If value of input equals a character's name in the array
            if (charName.toUpperCase() === character.toUpperCase()) {
                characterDisplayEl.innerHTML = "<h1 class='character-name'>" + charName + "</h1>";
               
            };
        };
    };
};

// function appendPhoto () {




//     var thumbnailApi = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362';


//     var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362';
//     fetch(marvelApiUrl)
//         .then(function (response) {
//             response.json().then(function (allData) {
//                 // Push all results to array
//                 characterArray.push(allData.data.results);
//             })
//         });
// }

searchFormEl.addEventListener('submit', formSubmitHandler);