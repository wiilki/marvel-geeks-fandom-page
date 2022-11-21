var characterInputEl = document.querySelector('#search-box');
var searchButton = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form')
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
            var charIdNum = newArray[k].id;
            // If value of input equals a character's name in the array
            if (charName.toUpperCase() === character.toUpperCase()) {
                console.log(charName);
                console.log(charIdNum);
            };
        };
    };
};

searchFormEl.addEventListener('submit', formSubmitHandler);