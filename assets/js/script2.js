
function init() {

    // Points to 100 array items at a time
    var limitOffset = [
        "limit=100&offset=0",
        "limit=100&offset=100",
        "limit=100&offset=200",
        "limit=100&offset=300",
        "limit=100&offset=400",
        "limit=100&offset=500",
        "limit=100&offset=600",
        "limit=100&offset=700",
        "limit=100&offset=800",
        "limit=100&offset=900",
        "limit=100&offset=1000",
        "limit=100&offset=1100",
        "limit=100&offset=1200",
        "limit=100&offset=1300",
        "limit=100&offset=1400",
        "limit=100&offset=1500"
    ];

    // Fetch Marvel array and push to array
    for (i = 0; i < limitOffset.length; i++) {
        var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=1a380943b10a057172bfb3d0c8676926&hash=d756b5220d6651f35ff1e5576f63f362&' + limitOffset[i];

        fetch(marvelApiUrl)
            .then(function (response) {
                response.json().then(function (allData) {
                    characterArray.push(allData.data.results);
                })
            });
    }
    console.log(characterArray)
};

init();