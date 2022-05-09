const passport = require('passport');
const SiteController = require('../controllers/SiteController');
const AuthController = require('../controllers/AuthController');
const CartController = require('../controllers/CartController');
const userValidator = require('../middleware/userValidator');
const LaptopType = require('../models/laptopType');
const Comment = require('../models/Comment');
const moment = require('moment');
require('../config/auth');

module.exports = function(app) {
    app.use(function(req, res, next) {
      LaptopType.find({}, function(err, types) {
        res.locals.laptopTypes = types;
        next();
      })
    })
    app.route('/laptop/:slug').get(SiteController.showLaptopDetail,async (req, res) => {
      const laptop = await req.laptop;
      res.render('pug', { laptop ,showLaptopDetail: true });
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
    app.route('/tim-kiem').get(SiteController.searchLaptop, (req, res) => {
      const result = req.result;
      result.laptops.forEach(laptop => {
        laptop.configuration["Ổ cứng"] = laptop.configuration["Ổ cứng"].match(/SSD|HDD/) + " " + laptop.configuration["Ổ cứng"].split(/SSD|HDD/)[0].trim();
      })
      res.render('pug', { result, showLaptopFound: true });
    });
    app.route('/Search/Product').post(SiteController.postSearchProduct);
    app.route('/Common/SuggestSearch').get(SiteController.suggestSearch, (req, res) => {
      const result = req.result;
      res.send(result);
    })
    app.route('/cart/api/product/GetProduct').post(handlePostCart, CartController.getProduct);
    app.route('/cart/api/cart/AddProduct').post(ensureAuthenticated, CartController.addProduct);
    app.route('/cart/api/cart/UpdateProduct').patch(ensureAuthenticated, CartController.updateProduct);
    app.route('/cart/api/cart/RemoveProduct').delete(ensureAuthenticated, CartController.deleteProduct);
    app.route('/cart').get(ensureAuthenticated, CartController.displayUserCart, (req, res) => {
      const cart = req.cart;
      res.render('pug', { cart, showUserCart: true });
    });

    app.route('/product/comment').post(SiteController.postComment, (req, res) => {
      const comment = req.comment;
      res.send({ comment, moment });
    });

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
      passport.authenticate('local', { failureRedirect: '/register', failureFlash: true }),AuthController.postLogin
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
    app.route('/test').get((req, res) => {
      res.render('pug');

    })
}

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function handlePostCart(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  else {
    req.status = 302;
    return next();
  }
  
}