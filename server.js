'use strict';

//Bring in dependencies
const express = require('express');
const zomato = require('zomato-api');
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

// Preparing zomato api key
const zomatoKey = zomato({
  userKey: '30d4a494d4c1cfa083e70daa7b4eb103'
});

// Routes

app.get('/', (request, response) => {
  response.status(200).render('pages/new');
});
app.get('/weather', weatherHandler);
app.post('/add', addWeather);
app.post('/places', placesHandler);
app.post('/zomato', zomatoHandler);
app.get('/favorites', favorites);
app.get('/aboutus', aboutUs);
app.delete('/delete/:id', deleteHandler);
app.get('*', errorHandler);

// Route handlers

function weatherHandler(request, response) {
  const search = request.query.search;
  const key = process.env.WEATHER_KEY;
  const url = `api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}&units=imperial`;
  superagent.get(url)
    .then(data => {
      let inst = new Weather(data);
      console.log(inst);
      response.status(200).render('pages/index', { info: inst });
    });
}

function addWeather(request, response) {
  const sql = 'INSERT INTO places (name, description, temp, sunrise, sunset, windspeed, lat, lon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);';
  const params = [request.body.name, request.body.description, request.body.temp, request.body.sunrise, request.body.sunset, request.body.windspeed, request.body.lat, request.body.lon];
  client.query(sql, params)
    .then(results => {
      response.status(200).redirect('/favorites');
    });
}

function placesHandler(request, response) {
  const search = request.body.name;
  const lat = request.body.lat;
  const lon = request.body.lon;
  let key = process.env.PLACES_API_KEY;
  const url = `https://places.ls.hereapi.com/places/v1/autosuggest?at=${lat},${lon}&q=${search}&apiKey=${key}`;
  superagent.get(url).then(data => {
    const places = data.body.results;
    let newPlaces = places.map(obj => new Place(obj));
    // console.log(1, places, 2, newPlaces);
    response.status(200).render('pages/places', { place: newPlaces, search: search });
  }).catch(error => {
    console.log(error);
  });
}

function zomatoHandler(request, response) {
  const lat = request.body.lat;
  const lon = request.body.lon;
  const search = request.body.name;
  const parameter = { 'lat': lat, 'lon': lon, 'count': 5 };
  zomatoKey.getCollections(parameter).then(data => {
    const restaurants = data.collections;
    let newRest = restaurants.map(obj => new Zomato(obj));  
    response.render('pages/zomato', { zomato: newRest, search: search });
  }).catch(error => {
    console.log(error);
  });
}

function favorites(request, response) {
  const sql = 'SELECT * FROM places;';
  client.query(sql).then(data => {
    let rows = data.rows;
    response.render('pages/favorites', { row: rows });
  }).catch(error => {
    console.log(error);
  });
}

function aboutUs(request, response) {
  response.render('pages/aboutus');
}

function deleteHandler(request, response) {
  const SQL = 'DELETE FROM places WHERE id = $1;';
  const params = [request.params.id];
  client.query(SQL, params)
    .then(response.status(200).redirect('/favorites'))
    .catch(error => errorHandler(request, response, error));
}

function errorHandler(error, response) {
  response.status(500).render('pages/error', { error: error });
}

// Constructors

function Weather(obj) {
  this.lon = obj.body.coord.lon;
  this.lat = obj.body.coord.lat;
  this.name = obj.body.name;
  this.description = obj.body.weather[0].description;
  this.temp = obj.body.main.temp;
  this.sunrise = new Date(obj.body.sys.sunrise * 1000).toString().slice(15, 25);
  this.sunset = new Date(obj.body.sys.sunset * 1000).toString().slice(15, 25);
  this.windspeed = obj.body.wind.speed;
}

function Place(obj) {
  this.title = obj.title || 'No title presented';
  this.vicinity = obj.vicinity || 'No location presented';
  this.category = obj.categoryTitle || 'No category presented';
}

function Zomato(obj) {
  this.name = obj.collection.title;
  this.description = obj.collection.description;
  this.url = obj.collection.url;
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App Listening on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
  });
