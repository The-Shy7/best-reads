<?php
/**
 * Name: Tahmin Talukder
 * Section : CSE 154 AQ
 * Date: May 24th, 2019
 *
 * This file provides back-end support for the API.
 * Based on the input parameters supplied using GET requests,
 * the API outputs different details about the books within the 'books' file
 * like reviews, ratings, titles, authors, etc. in different formats JSON and text.
 *
 * Web service details:
 *   Required GET parameters:
 *    - mode (optional search parameter)
 *    - (and/or) title
 *   Output Format (respectively):
 *    - mode=books: JSON
 *    - mode=books&search={title}: JSON
 *    - mode=description&title={title}: text
 *    _ mode=info&title={title}: JSON
 *    _ mode=reviews&title={title}: JSON
 *   Output Details:
 *    - If only mode is passed with "books", outputs an array of all of the books and their
 *      folder names in JSON
 *    - If the mode is passed with "books" and search is passed with a book title,
 *      outputs the JSON of the particular book, otherwise outputs an empty array
 *      if the book isn't found
 *    - If the mode is passed with "description" and the required title parameter
 *      with a specific title is passed, then it outputs the description of the
 *      book as plain text
 *    - If the mode is passed with "info" and the required title parameter
 *      with a specific title is passed, then it outputs the JSON of the book's
 *      title and author
 *    - If the mode is passed with "reviews" and the required title parameter
 *      with a specific title is passed, then it outputs the JSON array of the book's
 *      reviews, ratings, and comments.
 *    - If the required GET mode parameter is missing or is passed as something other
 *      than one of the 4 valid modes, the error message is outputted:
 *      "Please provide a mode of description, info, reviews, or books."
 *    - If the mode is passed as description, info, or review and the required
 *      title parameter is missing, an error with the message is returned:
 *      "Please remember to add the title parameter when using mode=<mode>."
 *      (replacing <mode> with whatever the passed mode is)
 *    - If the mode is passed as description, info, or review and the required title
 *      parameter was passed but no book for that title was found,
 *      an error with the message is returned:
 *      "No <mode> for <title> was found.""
 *      (replacing <mode> with the passed mode and <title> with the passed title)
 */

  if (isset($_GET["mode"]) && isset($_GET["title"])) {
    $mode = $_GET["mode"];

    if (!isset($_GET["title"])) {
      set_error("Please remember to add the title parameter when using mode={$mode}.");
    } else {
      $book = $_GET["title"];
      $file_path = "books/{$book}";

      if (!file_exists($file_path)) {
        set_error("No {$mode} for {$book} was found.");
      } else if ($mode === "description") {
        $description = glob($file_path . "/description.txt");
        description_text($description);
      } else if ($mode === "info") {
        $info = glob($file_path . "/info.txt");
        book_info($info);
      } else if ($mode === "reviews") {
        $book_reviews = glob($file_path . "/review" . "*" . ".txt");
        create_review($book_reviews);
      } else {
        set_error("Please provide a mode of description, info, reviews, or books.");
      }
    }
  } else if (!isset($_GET["title"])) {
    $mode = $_GET["mode"];

    if ($mode === "books" && isset($_GET["search"])) {
      $search = $_GET["search"];
      $search_info = glob("books/{$search}/info.txt");
      $search_folder = glob("books/{$search}");
      get_books($search_info, $search_folder);
    } else if ($mode === "books") {
      $info_dir = glob("books/*/info.txt");
      $folder_dir = glob("books/*");
      get_books($info_dir, $folder_dir);
    }
  } else {
    set_error("Please provide a mode of description, info, reviews, or books.");
  }

  /**
   * Outputs the description about the book in plain text format.
   * @param {array} $description - the description.txt file of the book
   */
  function description_text($description) {
    foreach ($description as $desc_text) {
      $data = file_get_contents($desc_text);
			header("Content-type: text/plain");
			echo $data;
		}
  }

  /**
   * Outputs information about the book: its title and author in JSON format.
   * @param {array} $book_infos - the info.txt file of the book
   */
  function book_info($book_infos) {
    foreach ($book_infos as $book_info) {
      $info = file($book_info, FILE_IGNORE_NEW_LINES);
      $output = array("title" => trim($info[0]), "author" => trim($info[1]));
      header("Content-type: application/json");
      echo json_encode($output);
    }
  }

  /**
   * Output a JSON array containing all of the reviews for the book,
   * the review rating, and the name of the reviewer
   * @param {array} $book_reviews - the review.txt files of the book
   */
  function create_review($book_reviews) {
    $review_json = array();
    $output = array();

    foreach ($book_reviews as $book_review) {
      $review = file($book_review, FILE_IGNORE_NEW_LINES);
      $review_json = array("name" => trim($review[0]), "rating" => (float)$review[1], "text" => trim($review[2]));
      array_push($output, $review_json);
    }

    header("Content-type: application/json");
    echo json_encode($output);
  }

  /**
   * Searches the specified file(s) and folder directories
   * and outputs a JSON array with the book's title and folder names
   * if the book isn't found, an empty array is outputted.
   * @param {array} $info_dir - the info.txt file of the book
   * @param {array} $folder_dir - the folder of the specified book
   */
  function get_books($info_dir, $folder_dir) {
    $info_json = array();
    $books_array = array();

    foreach ($info_dir as $info) {
      $title = trim(file($info, FILE_IGNORE_NEW_LINES)[0]);
      $name = dirname($info);
      $base = trim(basename($name));
      $info_json = array("title" => $title, "folder" => $base);
      array_push($books_array, $info_json);
    }

    $output = array("books" => $books_array);
    header("Content-type: application/json");
    echo json_encode($output);
  }

  /**
   * Helper method to set and print a 400 Invalid Request error
   * @param {string} $msg - error message to print details of invalid request
   */
  function set_error($msg) {
    header("HTTP/1.1 400 Invalid Request");
    echo $msg;
  }
?>
