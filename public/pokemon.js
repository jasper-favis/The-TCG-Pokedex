import { search } from "./utils.js";

$(document).ready(() => {
  const url = window.location.href;
  const gen = url.match(/\d$/)[0];
  const genButton = "#" + gen;
  const style = {
    "background-color": "#30a7d7",
    "color": "white"
  };
  $(genButton).css(style);
});

$("#burger-button").click(function (event) {
  $(".nav-links").toggleClass("displayFlexColumn");
});

// Go to cards page on nav link click.
$("#cards-link").click(async function (event) {
  $("body").css("display", "none");
  const query = "";
  await search({ query });

  // Go to cards page.
  $("#search-link").attr("href", "cards");
  $('#search-link')[0].click();
});

// Go to cards page with empty search query.
$("#view-cards-button").click(async function (event) {
  $("body").css("display", "none");
  const query = "";
  await search({ query });

  // Go to cards page.
  $("#search-link").attr("href", "cards");
  $('#search-link')[0].click();
});

// Toggle generation dropdown menu.
$(".gen-dropdown-button").click(function (event) {
  $(".gen-list").toggleClass("display");
});

// Search card based on Pokemon selection.
$(".pokemon").click(async function (event) {
  const name = $(this).attr("id");
  await search({ query: name });

  // Go to cards page.
  $("#search-link").attr("href", "cards");
  $('#search-link')[0].click();
});
