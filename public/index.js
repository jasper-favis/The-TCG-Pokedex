import { search } from "./utils.js";

$(document).ready(function () {
  getFilter("types");
  getFilter("rarities");
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

// Submit search.
$("#search-input").on("keyup", async function (event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    const query = event.target.value || "";
    await search({ query });

    // Go to cards page.
    $("#search-link").attr("href", "cards");
    $('#search-link')[0].click();
  }
});

///////////////////////////////////////////
//   H E L P E R     F U N C T I O N S   //
///////////////////////////////////////////

// Get list of types or rarities which will be used as
// filters for the card search. 
function getFilter(filter) {
  if (filter !== "types" && filter !== "rarities") {
    return;
  };

  const url = "https://api.pokemontcg.io/v2/" + filter;
  $.get(url, function ({ data }) {
    sessionStorage.setItem(filter, JSON.stringify(data));
  });
}

