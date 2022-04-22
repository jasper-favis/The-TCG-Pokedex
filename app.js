const express = require('express')
const https = require("https");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const pokeApiRoute = "https://pokeapi.co/api/v2/pokemon/";
const tcgApiRoute = "https://api.pokemontcg.io/v2/cards";
const api_key = process.env.API_KEY;
const options = { headers: { 'X-Api-Key': api_key } };
const pageSize = 16;
const GENERATIONS = [
  { offset: 0, limit: 151 },
  { offset: 151, limit: 100 },
  { offset: 251, limit: 135 },
  { offset: 386, limit: 107 },
  { offset: 493, limit: 156 },
  { offset: 659, limit: 72 },
  { offset: 721, limit: 88 },
  { offset: 809, limit: 96 },
  { offset: 905, limit: 3 }
]


// ejs - register view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Needed to serve static files (JS, CSS)

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/cards/info", function (req, res) {
  const searchEntries = req.body;
  const query = searchEntries.query || "";
  const queryType = searchEntries.queryType || "name";
  const page = searchEntries.page || 1;
  const params = `?q=${queryType}:${query}*&page=${page}&pageSize=${pageSize}`;
  const url = tcgApiRoute + params;

  // Get data from pokemontcg.io API
  https.get(url, options, (response) => {
    let rawData = '';
    response.on('data', (data) => {
      rawData += data; // Data is collected in chunks hence the sum.
    }).on('end', () => {
      const jsonData = JSON.parse(rawData);
      const count = jsonData.totalCount;
      const cards = jsonData['data'].map(card => {
        const cardInfo = {
          id: card.id,
          name: card.name,
          types: card.types,
          rarity: card.rarity,
          evolvesFrom: card.evolvesFrom,
          evolvesTo: card.evolvesTo,
          imgURL: card.images.large,
          tcgplayerPrices: card.tcgplayer,
        }
        return cardInfo;
      })

      const data = {
        cards,
        count,
        pageSize
      }

      res.send(data);
    })
  })
});

app.get("/cards", (req, res) => {
  res.render("cards");
});

app.get('/pokemon/:gen', function (req, res) {
  const gen = req.params.gen;
  const { offset, limit } = GENERATIONS[gen - 1];
  const firstPokemon = offset + 1;
  const url = `${pokeApiRoute}?offset=${offset}&limit=${limit}`;

  // Get data from pokeapi.co.
  https.get(url, apiRes => {

    let rawData = "";
    apiRes.on("data", data => {
      rawData += data; // Data is collected in chunks hence the sum.
    }).on("end", () => {
      const jsonData = JSON.parse(rawData);
      const { results } = jsonData;
      const pokemon = results.map(({ name }) => capitalize(name));
      res.render("pokemon", { pokemon, gen, firstPokemon });
    });
  });
});

// Middleware to handle 404 request. Must be placed at the bottom.
app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(port, () => console.log("Server running..."));

// H E L P E R   F U N C T I O N S



// To capitalize first character of a string.
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
