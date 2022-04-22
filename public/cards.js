import { search, removeCamelCase } from "./utils.js";

// Load cards and filter options on document load.
$(document).ready(function () {
  let loadedCards = {};
  const disable = {
    "background": "whitesmoke",
    "color": "lightgray"
  };

  const query = sessionStorage.getItem("query");
  const queryType = sessionStorage.getItem("queryType");
  const page = sessionStorage.getItem("page");
  const cardsData = JSON.parse(sessionStorage.getItem("cardsData"));

  if (cardsData == null) {
    return;
  }
  createFilterList(".types-list", "types");
  createFilterList(".rarity-list", "rarities");
  const { cards, count, pageSize } = cardsData;
  if (cards.length == 0) {
    $(".noResults").addClass("displayFlexColumn");
    $(".cards").css("display", "block");
    $(".pagination").css("display", "none");
    return;
  } else {
    $(".noResults").removeClass("displayFlexColumn");
  }
  const lastPage = Math.ceil(count / pageSize);

  // Change text and style on filter button if a filter
  // is selected.
  if (queryType !== null && queryType !== "name") {
    const filterSelected = {
      "color": "white",
      "background": "var(--primary-blue)",
      "border-color": "var(--primary-blue)"
    };
    $("." + queryType + ">p").text(query);
    $("." + queryType).css(filterSelected);
  }

  // Disable prev and next buttons if page is
  // first or last.
  if (page == lastPage) {
    $("#next-button").css(disable);
  }
  if (page == 1) {
    $("#prev-button").css(disable);
  }

  // Display cards.
  cards.forEach(card => {
    loadedCards[card.id] = card;
    const cardHTML = `
      <div class="card" id="${card.id}">
        <img
          src="${card.imgURL}"
          onerror="this.onerror=null; this.src='/images/img-unavailable.jpg'"
          alt="${card.name} Image"
        />
      </div>
    `;
    $(".cards").append(cardHTML);
  });

  // Load types and rarities for dropdown menus.
  sessionStorage.setItem("loadedCards", JSON.stringify(loadedCards));

});

// Toggle nav menu.
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

// Get cards when enter key is pressed inside the search bar.
$(document).ready(function () {
  // Submit search.
  $("#cards-search-input").on("keyup", async function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const query = event.target.value || "";
      await search({ query });

      // Go to cards page.
      $("#search-link").attr("href", "cards");
      $('#search-link')[0].click();
    }
  });
});

// Get cards base on search input on button click.
$("#cards-search-button").click(async function (event) {
  const query = $("#cards-search-input").val();
  await search({ query });

  // Go to cards page.
  $("#search-link").attr("href", "cards");
  $('#search-link')[0].click();
});

// Toggle modal that displays specific card information.
$(document).ready(function () {
  $(document).on("click", ".card", function () {
    const id = $(this).attr("id");
    const loadedCards = JSON.parse(sessionStorage.getItem("loadedCards"));
    let {
      name,
      types,
      rarity,
      evolvesFrom,
      evolvesTo,
      imgURL,
      tcgplayerPrices
    } = loadedCards[id];

    // Image
    $("#cardImg").attr("src", imgURL);

    // Name
    $("#name").text(name);

    // Rarity
    rarity = (rarity == null) ? "unknown" : rarity;
    $("#rarity div").text(rarity);

    // Types
    types.forEach(type => $("#types ul").append(`<li>${type}</li>`));

    // Evolves from...
    const ef = (evolvesFrom == null) ? "none" : evolvesFrom;
    $("#evolvesFrom div").text(ef);

    // Evolves to...
    if (evolvesTo != null) {
      evolvesTo.forEach((evolvedForm) => {
        $("#evolutions").append(`<div>${evolvedForm}</div`);
      });
    } else {
      $("#evolutions").text("none");
    }

    // TCG Player Prices
    if (tcgplayerPrices != null) {
      displayPrices(tcgplayerPrices.prices, ".tcgp-price-groups");
    } else {
      $(".tcgp-price-groups").text("Not Available");
    }

    // Toggle Modal
    $(".modal").toggleClass("displayFlex");
    $("body").toggleClass("disable-scroll");

    // Close modal.
    $(".modal").click(function (event) {
      $(".modal").removeClass("displayFlex");
      $("body").removeClass("disable-scroll");
      $("#rarity div").empty();
      $("#types ul").empty();
      $("#evolvesFrom div").empty();
      $("#evolutions").empty()
      $(".tcgp-price-groups").empty();
    });
  });
});

// Pagination - Go to previous page.
$("#prev-button").click(function (event) {
  const page = sessionStorage.getItem("page");
  const prevPage = parseInt(page) - 1;
  const clicked = {
    "background": "var(--primary-blue)",
    "border-color": "var(--primary-blue)",
    "color": "white"
  };
  if (isPageValid(prevPage)) {
    $("#prev-button").css(clicked);
    getPage(prevPage);
  }
});

// Pagination - Go to next page.
$("#next-button").click(function (event) {
  const page = sessionStorage.getItem("page");
  const nextPage = parseInt(page) + 1;
  const clicked = {
    "background": "var(--primary-blue)",
    "border-color": "var(--primary-blue)",
    "color": "white"
  };
  if (isPageValid(nextPage)) {
    $("#next-button").css(clicked);
    getPage(nextPage);
  }
});

// Toggle dropdown menu for types filter.
$(".types").click(function (event) {
  $(".types-list").toggleClass("display");
  $(".rarity-list").removeClass("display");
});

// Toggle dropdown menu for rarities filter.
$(".rarity").click(function (event) {
  $(".rarity-list").toggleClass("display");
  $(".types-list").removeClass("display");
});

// On filter click, get cards based on selected filter.
$(document).ready(function () {
  $(document).on("click", "li", function (event) {
    const parent = $(this.parentNode);
    let filter = this.id;
    let filterType = $(parent).attr("class");

    if (filterType == "types-list") {
      filterType = "types";
    } else if (filterType == "rarity-list") {
      filterType = "rarity";
      const noRare = filter.replace(/\s*[rR]are\s*/, "");
      const lastWord = noRare.match(/(\w+)$/)[0];
      filter = lastWord;
    } else {
      console.log("No filter type given");
      return;
    }

    getFilteredCards({ query: filter, queryType: filterType, page: 1 });
  });
});

///////////////////////////////////////////
//   H E L P E R     F U N C T I O N S   //
///////////////////////////////////////////

// Get cards on newPage.
const getPage = async (newPage) => {
  const query = sessionStorage.getItem("query");
  const queryType = sessionStorage.getItem("queryType");
  const page = sessionStorage.getItem("page");
  newPage = (isPageValid(newPage)) ? newPage : page;
  if (newPage !== page) {
    await search({ query, queryType, page: newPage });

    // Go to cards page.
    $("#search-link").attr("href", "cards");
    $('#search-link')[0].click();
  }
}

// Receives a tcgplayer.prices object and renders prices for each
// category under the elem tag. Categories are nested objects (ex. holofoil,
// reverseHolofoil...)
const displayPrices = (obj, elem) => {
  $.each(obj, (key, val) => {
    if (typeof val === "object" && val !== null) {
      const priceCategFormatted = removeCamelCase(key);

      $(elem).append(`<p id=${key}>${priceCategFormatted}<p>`);
      const { low, mid, high } = val;
      const prices = `
        <div>
          <span>Low: $${low.toFixed(2)}</span>
          <span>Mid: $${mid.toFixed(2)}</span>
          <span>High: $${high.toFixed(2)}</span>
        </div>
      `;
      $(`#${key}`).after(prices);
    }
  });
}

// Check if page number is within the page limits.
const isPageValid = (page) => {
  const pageSize = sessionStorage.getItem("pageSize");
  const count = sessionStorage.getItem("count");
  const lowerbound = 1;
  const upperbound = Math.ceil(count / pageSize);
  return (page >= lowerbound && page <= upperbound);
}

// Create filter dropdown menu. 
function createFilterList(elem, filterType) {
  const filterList = JSON.parse(sessionStorage.getItem(filterType));
  if (filterList == undefined) {
    console.log("Function createFilterList: No filterList");
    return;
  }

  filterList.forEach(filter => {
    // Skip "Rare" filter in rarities list.
    if (filter !== "Rare") {
      $(elem).append(`<li id="${filter}"><a>${filter}</a></li>`);
    }
  });
}

// Get cards based on filter option.
const getFilteredCards = async (options) => {
  const { query, queryType, page } = options;
  await search({ query, queryType, page });

  $("#search-link").attr("href", "cards");
  $('#search-link')[0].click();
}

