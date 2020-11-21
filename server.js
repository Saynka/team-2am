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


// Creating postgres client
const client = new pg.Client(process.env.DATABASE_URL);
const zomatoKey = zomato({
  userKey: '30d4a494d4c1cfa083e70daa7b4eb103'
})
const PORT = process.env.PORT || 3000;

// app.get('/', (req,res) => {
//   res.status(200).send('Shits GOOD');
// });






// Route

app.get('/', (req, res) => {
  res.status(200).render('pages/new');
});
app.get('/places/', places);
app.get('/zomato', zomato);
app.post('/weather', weatherHandler);
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
// }







// NOTE TO SELF

// BOTH APIS NEED LAT AND LON SO...

// WEATHER FIRST THEN PASS LAT/LON/SEARCH/DATA TO PLACES

// PLACES PASSES LAT/LON/SEARCH/DATA/DATA2 TO ZOMATO

// ZOMATO MAKES QUERY THEN RENDERS EVERYTHING TO /SHOW








function places(forecast) {
  const search = forecast.place;
  const lat = forecast.lat;
  const lon = forecast.lon;
  const url = `https://places.ls.hereapi.com/places/v1/autosuggest?at=${lat},${lon}&q=${search}&apiKey=${process.env.PLACES_API_KEY}`;
  let newPlaces;
  superagent.get(url).then(data => {
    const places = data.body.results;
    newPlaces = places.map(obj => new Place(obj));
  }).catch(error => {
    console.log(error);
  });
  return newPlaces;
}

function zomatoHandler(forecast) {
  const lat = forecast.lat;
  const lon = forecast.lon;
  const parameter = {'lat': lat, 'lon': lon, 'count': 5};
  let newRest;
  zomatoKey.getCollections(parameter).then(data => {
    const restaurants = data.collections;
    newRest = restaurants.map(obj => new Restaurant(obj));
    resultZomato = newRest;
  }).catch(error => {
    console.log(error);
  });
  return newRest;
}

function weatherHandler(request, response) {
  const search = request.body.search;
  const url = `api.openweathermap.org/data/2.5/weather?q=${search}&appid=${process.env.OPEN_WEATHER_MAP_API}`;
  // console.log('----', request);
  superagent.get(url)
    .then(data => {
      // console.log(data.body);
      const forecast = new Forecast(data.body);
      const returnObject = {
        'forecast': forecast,
        'places': places(forecast),
        'restaurants': zomatoHandler(forecast)
      };
      console.log('places', returnObject);
      response.render('pages/index', {'forecast': forecast, 'places': placesArr, 'zomato': zomatoArr});
    });
}

function favorites(request, response) {
  const sql = 'SELECT * FROM table;';
  client.query(sql).then(data => {
    const rows = data.rows;
    response.render('pages/favorites', { 'rows': rows });
  });
}

function aboutUs(request, response) {
  response.render('pages/aboutus');
}

// function handleError(req, res) {
//   res.status(404).render('pages/error');
// }

// Constructor

function Forecast(obj) {
  this.lat = obj.coord.lat,
    this.lon = obj.coord.lon,
    this.description = obj.weather.description,
    this.low = obj.main.temp_min,
    this.high = obj.main.temp_max,
    this.windSpeed = obj.wind.speed,
    this.place = obj.name
}

function Place(obj) {
    this.title = obj.title || 'No title presented',
    this.vicinity = obj.vicinity || 'No location presented',
    this.category = obj.categoryTitle || 'No category presented'
}

function Restaurant(obj) {
  this.name = obj.title,
  this.description = obj.description,
  this.image = obj.image_url
}

// client.connect()
//   .then(() => {
app.listen(PORT, () => {
  console.log(`App Listening on port: ${PORT}`);
});
//   })
//   .catch(error => {
//     console.log(error);
//   });

