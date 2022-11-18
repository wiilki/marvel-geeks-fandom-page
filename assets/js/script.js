var searchPage = document.querySelector('#search-bar');
var characterPage = document.querySelector('#character-display-page');
var newsPage = document.querySelector('#character-news');
var mediaPage = document.querySelector('#media-appearances');
var originsPage = document.querySelector('#origin-stories');
var rtPage = document.querySelector('#rt-reviews');
var searchBtn = document.querySelector('#search-button');
var goToCharacter = document.querySelector('.back-to-characer');

openSearch();

searchBtn.addEventListener("submit", function (event) {
    event.preventDefault();
    openCharacter();
});

goToCharacter.addEventListener("click", function (event) {
    event.preventDefault();
    openCharacter();
});

function openSearch() {
    searchPage.style.visibility = 'visible'
    characterPage.style.visibility = 'hidden';
    newsPage.style.visibility = 'hidden';
    mediaPage.style.visibility = 'hidden';
    originsPage.style.visibility = 'hidden';
    rtPage.style.visibility = 'hidden';
}

function openCharacter() {
    searchPage.style.visibility = 'hidden'
    characterPage.style.visibility = 'visible';
    newsPage.style.visibility = 'hidden';
    mediaPage.style.visibility = 'hidden';
    originsPage.style.visibility = 'hidden';
    rtPage.style.visibility = 'hidden';
}

function openNews() {
    searchPage.style.visibility = 'hidden'
    characterPage.style.visibility = 'hidden';
    newsPage.style.visibility = 'visible';
    mediaPage.style.visibility = 'hidden';
    originsPage.style.visibility = 'hidden';
    rtPage.style.visibility = 'hidden';
}

function openMedia() {
    searchPage.style.visibility = 'hidden'
    characterPage.style.visibility = 'hidden';
    newsPage.style.visibility = 'hidden';
    mediaPage.style.visibility = 'visible';
    originsPage.style.visibility = 'hidden';
    rtPage.style.visibility = 'hidden';
}

function openOrigins() {
    searchPage.style.visibility = 'hidden'
    characterPage.style.visibility = 'hidden';
    newsPage.style.visibility = 'hidden';
    mediaPage.style.visibility = 'hidden';
    originsPage.style.visibility = 'visible';
    rtPage.style.visibility = 'hidden';
}

function openRt() {
    characterPage.style.visibility = 'hidden';
    searchPage.style.visibility = 'hidden'
    newsPage.style.visibility = 'hidden';
    mediaPage.style.visibility = 'hidden';
    originsPage.style.visibility = 'hidden';
    rtPage.style.visibility = 'visible';
}

