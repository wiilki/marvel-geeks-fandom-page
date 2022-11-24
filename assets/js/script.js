
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
=======
// Get hero ID by searching through heroIDArray
var getHeroId = function (input) {
    var characterName = input.toUpperCase();
    for (var i = 0; i < heroIdArray.length; i++) {
        if (characterName === heroIdArray[i]["hero"].toUpperCase()) {
            nameDisplay.textContent = characterName;
            var heroIdNum = heroIdArray[i]["id"];
            renderHeroImg(heroIdNum);
            getMovieData(characterName);
        }
    }
}

// Fetch hero photo from API
var renderHeroImg = function (heroId) {
    var heroApiUrl = "https://gateway.marvel.com/v1/public/characters/" + heroId + "?ts=1&apikey=" + apiKey + "&hash=" + generatedHash;


    // Create <img> then assign API Url to image source
    fetch(heroApiUrl)
        .then(function (response) {
            response.json().then(function (heroData) {
                var fileExt = heroData.data.results[0].thumbnail.extension;
                var pathUrl = heroData.data.results[0].thumbnail.path.replace('http://', 'https://');
                var description = heroData.data.results[0].description;
                var heroResourceUrl = heroData.data.results[0].urls[0].url.replace('http://', 'https://');
                var imageLink = document.createElement('a')
                var heroImg = document.createElement('img');
                var heroDescription = document.createElement('p');

                // Clears out any current photo
                heroDisplayEl.innerHTML = '';
                heroImg.innerHTML = '';

                heroImg.src = pathUrl + '/portrait_xlarge.' + fileExt;;
                heroImg.classList.add("hero-image")
                imageLink.href = heroResourceUrl;
                imageLink.target = "_blank";

                // Clears out any current description
                heroDescription.innerHTML = '';
                heroDescription.textContent = description;
                heroDescription.classList.add("hero-description");

                // Render hero image and description to page
                imageLink.appendChild(heroImg)
                heroDisplayEl.appendChild(imageLink);
                heroDisplayEl.appendChild(heroDescription)

                // Get events details Array
                var eventsArray = heroData.data.results[0].events.items;
                getHeroEvents(eventsArray);
            })
        })
}

// Retrieve hero's events url
var getHeroEvents = function (allEvents) {
    for (j = 0; j < allEvents.length; j++) {
        // Assign event name and URL
        var eventName = allEvents[j].name;
        var eventUri = allEvents[j].resourceURI.replace('http://', 'https://');
        // Call next function
        getEventDetails(eventUri, eventName);
    }
}

// Fetch event specific url
var getEventDetails = function (uri, eventTitle) {
    var eventsApi = uri + "?ts=1&apikey=" + apiKey + "&hash=" + generatedHash;

    fetch(eventsApi)
        .then(function (response) {
            response.json().then(function (eventData) {

                // Create and render link to page
                var eventDetailsUrl = eventData.data.results[0].urls[0].url.replace('http://', 'https://')
                var addEvents = document.createElement('a');
               
                // Assign value to tag
                addEvents.textContent = eventTitle;               
                addEvents.href =  eventDetailsUrl;

                // Render tag to page
                heroEventsEl.appendChild(addEvents);
            })
        })
}

function getMovieData(heroName) {
    var omdbApiKey = "d66cee3f"
    // API requires "+" symbol where spaces would be
    var movieName = heroName.replace(/\s/g, '+');
    // OMDC API URL
    var omdbApiUrl = "https://www.omdbapi.com/?t=" + movieName + "&apikey=" + omdbApiKey;

    fetch(omdbApiUrl)
        .then(function (response) {
            response.json().then(function (movieData) {

                // Get poster URL and movie ratings
                var moviePosterUrl = movieData.Poster.replace('http://', 'https://');
                var metascore = movieData.Ratings[2].Value;
                var rottenscore = movieData.Ratings[1].Value;
                var imdbScore = movieData.Ratings[0].Value;
                var addPoster = document.createElement('img');
                var addScores = document.createElement('h3');

                // Assign value to tags
                addPoster.src = moviePosterUrl;
                addScores.textContent = "Metacritic: " + metascore + " --- Rotten Tomatoes: " + rottenscore + " --- IMDB: " + imdbScore;

                // Render tags to page
                movieReviewsEl.appendChild(addScores);
                movieReviewsEl.appendChild(addPoster);
                addScores.classList.add("movie-review-display")

            })
        })


}

// function fetchTest() {
//     fetch('https://gateway.marvel.com/v1/public/characters/1009351/stories?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362')
//         .then(function (response) {
//             console.log(response)
//         })
// }

// fetchTest();
searchFormEl.addEventListener('submit', formSubmitHandler);



