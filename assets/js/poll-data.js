// // import '.env'
// // console.log(env)

// var charactersArray2 = []

// function init() {

//     // Points to 100 array items at a time
//     var limitOffset = [
//         "limit=100&offset=0",
//         "limit=100&offset=100",
//         "limit=100&offset=200",
//         "limit=100&offset=300",
//         "limit=100&offset=400",
//         "limit=100&offset=500",
//         "limit=100&offset=600",
//         "limit=100&offset=700",
//         "limit=100&offset=800",
//         "limit=100&offset=900",
//         "limit=100&offset=1000",
//         "limit=100&offset=1100",
//         "limit=100&offset=1200",
//         "limit=100&offset=1300",
//         "limit=100&offset=1400",
//         "limit=100&offset=1500",
//         // "limit=100&offset=1600",
//         // "limit=100&offset=1700",
//         // "limit=100&offset=1800"
//     ];
//     // loop(limitOffset);
//     standard();
    
//     console.log(charactersArray2)
//     console.log(charactersArray)
   

    
// };

// function standard()
// {

//     var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&name=Hulk&apikey=5c7c9b1197b1acab4c35914e52e3d2de&hash=1b4af5cb2f24c39efbb7806237705b95&';

//     fetch(marvelApiUrl)
//         .then(function (response) {
//             console.log(response.status)
//             // console.log(response.json());
//             // console.log(response.status)
//             response.json().then(function (allData) {
//                 // Push all results to array
//                 charactersArray2.push(allData.data.results);
//                 // console.log(charactersArray2)
//             })
//         });

// }

// function loop(limitOffset)
//     {

//         // Fetch 100 characters at a time for 16 times (Total # of characters = 1562) 
//         for (i = 0; i < limitOffset.length; i++) {
//             console.log(i)
//             var marvelApiUrl = 'http://gateway.marvel.com/v1/public/characters?ts=1&apikey=5c7c9b1197b1acab4c35914e52e3d2de&hash=1b4af5cb2f24c39efbb7806237705b95&' + limitOffset[i];;
//             // fetch(requestUrl)
//             //     .then(function (response) {
//             //     console.log(response);
//             //     if (response.status === 200) {
//             //         responseText.textContent = response.status;
//             //     }
//             //     return response.json();
//             // });
//             fetch(marvelApiUrl)
//                 .then(function (response) {
//                     console.log(response.status)
//                     // console.log(response.json());
//                     // console.log(response.status)
//                     response.json().then(function (allData) {
//                         // Push all results to array
//                         charactersArray2.push(allData.data.results);
//                         // console.log(charactersArray2)
//                     })
//                 });
//         }

//     }

// init();