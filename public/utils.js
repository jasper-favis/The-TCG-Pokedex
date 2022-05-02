export const search = async (options) => {
  const query = trimWhiteSpace(options.query) || "";
  const queryType = options.queryType || "name";
  const page = options.page || 1;
  const searchEntries = { query, queryType, page };

  // 1. Get card data and save important session data.
  // 2. Go to cards page.
  await $.post("cards/info", searchEntries, function (res) {
    // Store to sessionStorage.
    sessionStorage.setItem("query", query);
    sessionStorage.setItem("queryType", queryType);
    sessionStorage.setItem("page", page);
    sessionStorage.setItem("pageSize", res.pageSize);
    sessionStorage.setItem("count", res.count);
    sessionStorage.setItem("cardsData", JSON.stringify(res));
  });
  return;
}

// To capitalize first character of a string.
export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Used to parse strings that use camelCase formatting. Places whitespace
// before each capitalized character and capitalizes first character.
// thisExample --> This Example
export const removeCamelCase = str => {
  const result = str.replace(/([a-z])([A-Z])/g, "$1 $2");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

export const scrollTo = (elem) => {
  $([document.documentElement, document.body]).animate({
    scrollTop: $(elem).offset().top
  }, 1000);
}

function trimWhiteSpace(str) {
  return str.replace(/\s/g, "");
}