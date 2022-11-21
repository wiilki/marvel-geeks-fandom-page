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


    
    
    searchFormEl.addEventListener('submit', formSubmitHandler);