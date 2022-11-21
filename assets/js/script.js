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

function getCharData(character) {
    for (j = 0; j < characterArray.length; j++) {
        var newArray = characterArray[j];
        for (k = 0; k < newArray.length; k++) {
            var charName = newArray[k].name;
            if (charName.toUpperCase() === character.toUpperCase()) {
                console.log(charName);
            };
        };
    };
};


searchFormEl.addEventListener('submit', formSubmitHandler);