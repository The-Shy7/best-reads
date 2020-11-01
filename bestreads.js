/**
 * Name: Tahmin Talukder
 * Date: May 24th, 2019
 * Section: CSE 154 AQ
 * This is the JS that implements functionality to the bestreads.html
 * page and gets data from the bestreads API
 * to fill the book list with all of the books within the books folder.
 * The user can click on any of the books within the list for more information
 * on that specific book.
 */

(function() {
  "use strict";

  const URL = "bestreads.php";
  const NUM_BOOKS = 19;

  /**
   *  Add a function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * Once the windows loads, the page is populated with a book list
   * for the user to see. The buttons are also given their funcionalities.
   */
  function init() {
    id("home").addEventListener("click", home);
    id("back").addEventListener("click", back);
    id("search-btn").addEventListener("click", search);
    populateBookList();
  }

  /**
   * Requests for all of the books from the API and populates the main page with
   * a list of books for the user to look and click for more infomation
   * on certain books. The home button is disabled on this page.
   */
  function populateBookList() {
    let url = URL + "?mode=books";
    id("home").disabled = true;

    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(addToBookList)
      .catch(errorView);
  }

  /**
   * Takes the JSON returned by the API and adds all of the books
   * to the book list with their covers and titles. Each card containing
   * the book is clickable and will go to another page with more information
   * about the book that was clicked.
   * @param {object} booksJson - the JSON returned from the API request.
   */
  function addToBookList(booksJson) {
    let bookList = id("book-list");

    for (let i = 0; i < booksJson.books.length; i++) {
      let book = document.createElement("div");
      let title = booksJson.books[i].title;
      let folder = booksJson.books[i].folder;
      book.id = folder;
      let img = document.createElement("img");
      img.src = "books/" + folder + "/cover.jpg";
      img.alt = "The cover of the book " + title;
      let text = document.createElement("p");
      text.innerText = title;
      book.addEventListener("click", function() {
        singlePageView(folder);
      });
      book.classList.add("selectable");
      book.appendChild(img);
      book.appendChild(text);
      bookList.appendChild(book);
    }
  }

  /**
   * When a book is clicked, the view is switched from the book list
   * to a page with more information on the clicked book. The information
   * includes the author, reviews, ratings, and a description. The back
   * button appears on this page for the user to click.
   * @param {object} folder - the name of the folder of the book
   */
  function singlePageView(folder) {
    id("book-list").classList.add("hidden");
    id("single-book").classList.remove("hidden");
    id("back").classList.remove("hidden");
    id("home").disabled = true;
    getDescription(folder);
    getBookCover(folder);
    getReviews(folder);
    getAuthorAndTitle(folder);
  }

  /**
   * Gets the author and title of the book that was clicked
   * and adds it to the single book page.
   * @param {object} folder - the name of the folder of the book
   */
  function getAuthorAndTitle(folder) {
    let url = URL + "?mode=info&title=" + folder;

    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(function(infoJson) {
        id("book-title").innerText = infoJson.title;
        id("book-author").innerText = infoJson.author;
      })
      .catch(errorView);
  }

  /**
   * Gets the description of the book that was clicked
   * and adds it to the single book page.
   * @param {object} folder - the name of the folder of the book
   */
  function getDescription(folder) {
    let url = URL + "?mode=description&title=" + folder;

    fetch(url)
      .then(checkStatus)
      .then(function(description) {
        id("book-description").innerText = description;
      })
      .catch(errorView);
  }

  /**
   * Gets the cover of the book that was clicked
   * and adds it to the single book page.
   * @param {object} folder - the name of the folder of the book
   */
  function getBookCover(folder) {
    let url = URL + "?mode=books&search=" + folder;

    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(addBookCover)
      .catch(errorView);
  }

  /**
   * Takes the JSON returned from API and adds the image
   * of the book's cover to the single book page.
   * @param {object} bookJson - the JSON returned from the API request.
   */
  function addBookCover(bookJson) {
    let title = bookJson.books[0].title;
    let folder = bookJson.books[0].folder;
    id("book-cover").src = "books/" + folder + "/cover.jpg";
    id("book-cover").alt = "The cover of the book " + title;
  }

  /**
   * Gets the reviews of the book such as the name(s) of the reviewers,
   * ratings, and comments that was clicked and adds it to the single book page.
   * @param {object} folder - the name of the folder of the book
   */
  function getReviews(folder) {
    let url = URL + "?mode=reviews&title=" + folder;

    fetch(url)
      .then(checkStatus)
      .then(JSON.parse)
      .then(addReviews)
      .catch(errorView);
  }

  /**
   * Takes the JSON returned from API and adds the book's reviews such as the
   * name(s) of the reviewers, ratings, and comments that was clicked
   * to the single book page.
   * @param {object} reviewsJson - the JSON returned from the API request.
   */
  function addReviews(reviewsJson) {
    let reviewSection = id("book-reviews");
    let total = 0;

    for (let i = 0; i < reviewsJson.length; i++) {
      let reviewer = document.createElement("h3");
      let reviewRating = document.createElement("h4");
      let reviewText = document.createElement("p");
      let name = reviewsJson[i].name;
      let rating = reviewsJson[i].rating;
      let text = reviewsJson[i].text;
      total += rating;
      reviewer.innerText = name;
      reviewRating.innerText = "Rating: " + rating.toFixed(1);
      reviewText.innerText = text;
      reviewSection.appendChild(reviewer);
      reviewSection.appendChild(reviewRating);
      reviewSection.appendChild(reviewText);
    }

    id("book-rating").innerText = (total / reviewsJson.length).toFixed(1);
  }

  /**
   * When the request isn't processed successfully an error message will
   * appear on the page. The home button is enabled for the user to go back
   * to the book list.
   */
  function errorView() {
    id("error-text").innerText = "Something went wrong with the request. Please try again later.";
    id("home").disabled = false;
  }

  /**
   * Switches the page to the book list view after the button is clicked.
   * The button is only enabled when there is an error or after a search query.
   */
  function home() {
    id("book-list").innerHTML = "";
    id("back").classList.add("hidden");
    id("search-term").value = "";
    populateBookList();
  }

  /**
   * Switches the page back to the book list view. If the page is
   * the search query page, then the home button is enabled.
   */
  function back() {
    id("book-description").innerHTML = "";
    id("book-reviews").innerHTML = "";
    id("book-rating").innerHTML = "";
    id("book-cover").innerHTML = "";
    id("single-book").classList.add("hidden");
    id("back").classList.add("hidden");
    id("book-list").classList.remove("hidden");

    if (id("book-list").childNodes.length < NUM_BOOKS) {
      id("home").disabled = false;
    }
  }

  /**
   * Filters out any books that match the user's search query.
   */
  function search() {
    let searchTerm = id("search-term").value;
    let formatTerm = searchTerm.toLowerCase().trim().split(" ").join("");
    id("home").disabled = false;
    let allBooks = id("book-list").childNodes;
    let searchBooks = [];

    for (let i = 0; i < allBooks.length; i++) {
      if (allBooks[i].id.includes(formatTerm)
          || allBooks[i].innerText.includes(searchTerm.trim())) {
        searchBooks.push(allBooks[i].id);
      }
    }

    id("book-list").innerHTML = "";

    for (let j = 0; j < searchBooks.length; j++) {
      let url = URL + "?mode=books&search=" + searchBooks[j];

      fetch(url)
        .then(checkStatus)
        .then(JSON.parse)
        .then(function(json) {
          addToBookList(json);
        })
        .catch(function() {
          id("error-text").innerText = "No books found that match the search string "
                                        + searchTerm.trim() + ", please try again.";
        });
    }
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @returns {object} - valid result text if response was successful, otherwise rejected
   *                     Promise result
   */
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300 || response.status === 0) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
  }
})();
