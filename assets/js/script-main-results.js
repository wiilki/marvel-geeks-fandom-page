// document query selectors
var movie_title = document.querySelector('#movie-title');
var movie_img = document.querySelector('#movie-img');

// main function
var processCharacter = () =>
{
    // grab all query strings
    var queryString = document.location.search;
    var subquery = queryString.split('?');
    // decode %20 that occurs when whitespace is detected
    var character =  decodeURI(subquery[1].split('=')[1])
    var imgLink = subquery[2].split('=')[1]
    var imgExt = subquery[3].split('=')[1]
    var thumbnailApi = imgLink + '/portrait_xlarge.' + imgExt;
    console.log(thumbnailApi)
    // check if character was not empty and dynamically update webpage
    if (character) {
        movie_title.textContent = character;
        movie_img.src =thumbnailApi;
    }
    // return to default page
    else {
        document.location.replace('./index.html');
    }
}


processCharacter()