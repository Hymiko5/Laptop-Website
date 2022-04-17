const passport = require('passport');
const SiteController = require('../controllers/SiteController');
const AuthController = require('../controllers/AuthController');
const userValidator = require('../middleware/userValidator');
const LaptopType = require('../models/laptopType');
require('../config/auth');

module.exports = function(app) {
    app.use(function(req, res, next) {
      LaptopType.find({}, function(err, types) {
        res.locals.laptopTypes = types;
        next();
      })
    })
    app.route('/laptop/:slug').get(SiteController.showLaptopDetail, (req, res) => {
      const laptop = req.laptop;
      res.render('pug', { laptop,showLaptopDetail: true });
    })
    app.route('/laptop-ldp').get(SiteController.showListLaptop,(req, res) => {
        const user = req.user;
        const laptopTypes = req.laptopTypes;
        laptopTypes.forEach(type => {
          type.laptops.forEach(laptop => {
            laptop.configuration["Ổ cứng"] = laptop.configuration["Ổ cứng"].match(/SSD|HDD/) + " " + laptop.configuration["Ổ cứng"].split(/SSD|HDD/)[0].trim();
           })
        })
        res.render('pug', {laptopTypes, showHome: true, showNews: true });
    })
    
    app.route('/').get((req, res) => {
        res.redirect('/laptop-ldp');
    });
    app.route('/auth/failed').get(AuthController.authFailed);
    app.route('/auth/success').get(ensureAuthenticated, AuthController.authSuccess);
    app.route('/register').get((req, res) => {
      res.render('pug', { showRegister: true });
    });
    app.route('/register').post(userValidator, AuthController.register)
    app.route('/login').get(AuthController.getLogin);
    app.route('/login').post( 
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),AuthController.postLogin
    );
    app.route('/auth/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.route('/auth/google/callback').get( 
      passport.authenticate('google', { failureRedirect: '/auth/failed' }),
      AuthController.getGoogle);

    app.route('/auth/facebook').get(passport.authenticate('facebook', {
      authType: 'rerequest',
      scope: ['user_friends', 'email', 'public_profile'],
      }));

    app.route('/auth/facebook/callback').get( 
      passport.authenticate('facebook', { failureRedirect: '/auth/failed' }),
      AuthController.getFacebook);

    app.route('/logout').get(AuthController.logout);
    app.route('/auth/check').post(AuthController.checkEmail);
}

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}