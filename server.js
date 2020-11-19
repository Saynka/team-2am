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

// function handleError(req, res) {
//   res.status(404).render('pages/error');
// }



