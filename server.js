'use strict';

//Bring in dependencies
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const { response } = require('express');

//Setting up the application
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// Declare port for server
const PORT = process.env.PORT || 3000;

// Creating postgres client
const client = new pg.Client(process.env.DATABASE_URL);

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



client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App Listening on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
  });