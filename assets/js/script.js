var characterInputEl = document.querySelector('#search-box');
var searchButton = document.querySelector('#search-btn');
var searchFormEl = document.querySelector('#search-form')
var characterArray = [];

// // Even handler for new character search
// var formSubmitHandler = function (event) {
//     event.preventDefault();
//     var characterName = characterInputEl.value.trim();
//     // Blank error message
//     if (characterName) {
//         fetchAllData(characterName);
//         // Clear input box
//         characterInputEl.value = '';
//     } else {
//         alert("Cannot be blank");
//     };
// };

// var fetchAllData = function (char) {
//     // Call api by char name first
//     var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362';

//     // Fetch for current weather conditions
//     fetch(marvelApiUrl)
//         .then(function (response) {
//             // Error if response cannot find char
//             if (response.ok) {
//                 response.json().then(function (charData) {
//                     charName = charData.data.results;
//                     for (i = 0; i < charName.length; i++) {
//                         if (charName[i] === char) {
//                             console.log(charName);
//                         }
//                     }                })
//             } else {
//                 alert("Check your spelling");
//             }
//         }).catch(function (error) {
//             alert("Unable to connect");
//         });
// };

// var findCharData = function (charData) {
//     charName = charData.data.results;
//     for (i = 0; i < charName.length; i++) {
//         if (charName[i] === char) {
//             console.log(charName);
//         }
//     }
// }


// searchFormEl.addEventListener('submit', formSubmitHandler);