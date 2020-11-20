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


// Creating postgres client
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
  res.status(200).render('pages/new');
});


function weatherHandler(req, res) {
  const search = req.query.search;
  const key = process.env.WEATHER_KEY;
  console.log(search);
  const url = `api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}&units=imperial`;

  superagent.get(url)
    .then(data => {
      let inst = new Weather(data);
      // console.log(data.body);
      res.status(200).render('pages/index', { info: inst });
      console.log(inst);
    });
}

function addWeather(req, res) {
  const sql = 'INSERT INTO places (name, description, temp, sunrise, sunset, windspeed) VALUES ($1, $2, $3, $4, $5, $6);';
  const params = [req.body.name, req.body.description, req.body.temp, req.body.sunrise, req.body.sunset, req.body.windspeed];

  client.query(sql, params)
    .then(results => {
      res.status(200).redirect('/favorites');
    });
}

function deleteHandler(request, response) {
  const SQL = 'DELETE FROM places WHERE id = $1;';
  const params = [request.params.id];
  client.query(SQL, params)
    .then(response.status(200).redirect('/'))
    .catch(error => errorHandler(request, response, error));
}

function errorHandler(error, response) {
  response.status(500).render('pages/error', { error: error });
}


// Route
// app.get('/', renderHome);
app.get('/show', places);
app.get('/weather', weatherHandler);
// app.post('/weather', (req,res) => {
//   res.status(200).render('pages/index');
// });
app.delete('/delete/:id', deleteHandler);
app.post('/add', addWeather);
// app.get('/zomato', zomato);
app.get('/favorites', favorites);
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
    response.render('pages/show', { 'places': newPlaces });
  });
}

// function zomato (request, response) {
//   const lat
// }

function favorites(request, response) {
  const sql = 'SELECT * FROM places;';
  client.query(sql)
    .then(data => {
      let rows = data.rows;
      response.render('pages/favorites', { row: rows });
    });
}

function aboutUs(request, response) {
  response.render('pages/about-us');
}

// function handleError(req, res) {
//   res.status(404).render('pages/error');
// }

// Constructor


function Place(obj) {
  this.title = obj.title;
  this.vicinity = obj.vicinity;
  this.category = obj.categoryTitle;
}

function Weather(obj) {
  this.name = obj.body.name;
  this.description = obj.body.weather[0].description;
  this.temp = obj.body.main.temp;
  this.sunrise = new Date(obj.body.sys.sunrise * 1000).toString().slice(15, 25);
  this.sunset = new Date(obj.body.sys.sunset * 1000).toString().slice(15, 25);
  this.windspeed = obj.body.wind.speed;
}

