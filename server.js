'use strict';
const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;

require('dotenv').config();
const apiRoutes  = require('./routes/api.js');

let app = express();
app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));

app.route('/').get((req, res) => {
    res.render('pug');
})

const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });