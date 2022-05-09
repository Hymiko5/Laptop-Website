'use strict';
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const expect      = require('chai').expect;
require('dotenv').config();
const userRoutes = require('./routes/api');
const slug = require('mongoose-slug-generator');
const passport = require('passport');
const session = require('express-session');
const moment = require('moment');
const MongoStore = require('connect-mongo')(session);
const URI = process.env['MONGO_URI'];
const store = new MongoStore({ url: URI });
const main = require('./config/db/connection').main;
const helmet = require("helmet");
var morgan = require('morgan');

let app = express();
app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(helmet());
// app.use(morgan('common'));

app.use(session({
  secret: process.env['SESSION_SECRET'],
  key: 'express.sid',
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false }
}));



app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(passport.initialize());
app.use(passport.session())
app.use(function(req, res, next) {
    res.locals.user = req.user || null;
    res.locals.moment = moment;
    next();
})

const mongoose = require('mongoose');
mongoose.plugin(slug);
main().catch(err => {
  console.log(err);
  throw new Error('Unable to connect to Database');
})
userRoutes(app);



const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });