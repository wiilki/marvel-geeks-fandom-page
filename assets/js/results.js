// document query selectors
var movie_title = document.querySelector('#movie-title');
var movie_img = document.querySelector('#movie-img');
var rottenTomatoesScore = document.querySelector('#rotten-tomatoes-score');
var plot = document.querySelector('#plot');
var releasedDate =document.querySelector('#released-date');
var ratingScore =document.querySelector('#rating-score');

// main function
var processCharacter = () =>
{
    // grab all query strings
    var queryString = document.location.search;
    var subquery = queryString.split('?');
    // grab variables
    var character =  decodeURI(subquery[1].split('=')[1])
    var imagePoster = subquery[2].split('=')[1]
    console.log(subquery[3].split('=')[1])
    var rottenTomatoesScoreStr = subquery[3].split('=')[1]
    var plotStr = decodeURI(subquery[4].split('=')[1])
    var releasedDateStr = decodeURI(subquery[5].split('=')[1])
    var ratedStr = decodeURI(subquery[6].split('=')[1])
    
    // check if character was not empty and dynamically update webpage
    if (character) {
        // update the webpage dynamically with variables
        movie_title.textContent = character;
        movie_img.src = imagePoster;
        rottenTomatoesScore.textContent = "Rotten Tomatoes: " + rottenTomatoesScoreStr;
        plot.textContent = plotStr;
        releasedDate.textContent = releasedDateStr;
        ratingScore.textContent = ratedStr
    }
    // return to default page
    else {
        document.location.replace('./index.html');
    }
}


processCharacter()