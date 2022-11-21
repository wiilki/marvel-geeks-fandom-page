
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

    // Fetch 100 characters at a time for 16 times (Total # of characters = 1562) 
    for (i = 0; i < limitOffset.length; i++) {
        var marvelApiUrl = 
        fetch(marvelApiUrl)
            .then(function (response) {
                response.json().then(function (allData) {
                    // Push all results to array
                    charactersArray.push(allData.data.results);
                    console.log(charactersArray.json())
                })
            });
    }
   

    
};

init();