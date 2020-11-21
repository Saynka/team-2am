'use strict';

//Bring in dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const { response } = require('express');
const methodOverride = require('method-override');

require('dotenv').config();



//Setting up the application
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Declare port for server
const PORT = process.env.PORT || 3000;


// Creating postgres client
const client = new pg.Client(process.env.DATABASE_URL);

// app.get('/', (req,res) => {
//   res.status(200).send('Shits GOOD');
// });

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App Listening on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
  });

app.get('/', (req,res) => {
  res.status(200).render('pages/new');
});

app.get('/weather', weatherHandler);


function weatherHandler(req,res) {
  const search = req.body.search;
  const key = process.env.WEATHERKEY;
  console.log(search);
  const url = `api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}`;

  superagent.get(url)
    .then( data => {
      console.log(data.body);
    });
}


// Route
// app.get('/', renderHome);
app.get('/show', places);
app.post('/favorites', favorites);
app.get('/aboutus', aboutUs);
// app.get('*', handleError);

//ROUTE Handlers

// function renderHome(req, res) {
//   console.log('render home');
//   const sql = 'SELECT * FROM booktable;';
//   return client.query(sql)
//     .then(results => {
//       console.log(results.rows);
//       res.status(200).render('pages/index');
//     })
//     .catch((error) => {
//       console.log(error);
//       res.render('pages/error');
//     });
// }

function places(request, response) {
  const search = request.query.search;
  const lat = request.query.lat;
  const lon = request.query.lon;
  const url = `https://places.ls.hereapi.com/places/v1/autosuggest?at=${lat},${lon}&q=${search}&apiKey=${process.env.PLACES_API_KEY}`;
  superagent.get(url).then(data => {
    const places = data.results;
    const newPlaces = places.forEach(obj => {
      const place = new Place(obj);
    });
    response.render('pages/show', { 'places': newPlaces});
  });
}

function favorites (request, response) {
  const sql = 'SELECT * FROM table;';
  client.query(sql).then(data => {
    const rows = data.rows;
    response.render('pages/favorites', { 'rows': rows});
  });
}

function aboutUs (request, response) {
  response.render('pages/about-us');
}

function zomato(request, response) {
  console.log(request.query);
  const query = request.query.search;
  const url = `https://developers.zomato.com/api/v2.1/search?q=restaurant&lat=47.6062&lon=122.3321`;
  superagent.get(url).then(data => {
    const restaurants = data.resataurants;
    const newRest = restaurants.map(obj => new restaurants(obj));
    response.render('pages/show')
  })
}

// function handleError(req, res) {
//   res.status(404).render('pages/error');
// }

// Constructor


function Place (obj) {
  this.title = obj.title,
  this.vicinity = obj.vicinity,
  this.category = obj.categoryTitle
}

