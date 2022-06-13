const passport = require('passport');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
const FACEBOOK_APP_ID = process.env['FACEBOOK_APP_ID'];
const FACEBOOK_APP_SECRET = process.env['FACEBOOK_APP_SECRET'];
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    if (err) console.log(err);
    done(null, user);
  })
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function (username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
      return done(null, user);
    });
  }
));


passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
},
  function (accessToken, refreshToken, profile, cb) {
    // use the profile info (mainly profile id) to check if the user is register in ur db
    User.findOne({
      $or: [
        { 'google.id': profile.id },
        { 'email': profile.emails[0].value }
      ]
    }, function (err, user) {
      if (err) console.log(err);
      else if (user) {
        user.google.displayName = profile.displayName;
        user.google.email = profile.emails[0].value;
        user.google.photo = profile.photos[0].value;
        user.save();

        return cb(null, user);

      }
      else {
        const newUser = new User();
        newUser.google.id = profile.id;
        newUser.google.displayName = profile.displayName;
        newUser.google.email = profile.emails[0].value;
        newUser.google.photo = profile.photos[0].value;
        newUser.userName = profile.name.givenName + ' ' + profile.name.familyName;
        newUser.email = profile.emails[0].value;
        newUser.photo = profile.photos[0].value;
        newUser.save(function (err) {
          if (err) console.log(err);
        });
        console.log("a user successfully created");
        return cb(null, newUser);
      }

    })
  }
));

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link', 'photos']
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOne({
      $or: [
        { 'facebook.id': profile.id },
        { 'email': profile.emails[0].value }
      ]
    }, function (err, user) {
      if (err) console.log(err);
      else if (user) {
        user.facebook.displayName = profile.displayName;
        user.facebook.email = profile.emails[0].value;
        user.facebook.photo = profile.photos[0].value;
        user.save();
        return cb(null, user);
      }
      else {
        const newUser = new User();
        newUser.facebook.id = profile.id;
        newUser.facebook.displayName = profile.displayName;
        newUser.facebook.email = profile.emails[0].value;
        newUser.facebook.photo = profile.photos[0].value;
        newUser.userName = profile.name.givenName + ' ' + profile.name.familyName;
        newUser.email = profile.emails[0].value;
        newUser.photo = profile.photos[0].value;
        newUser.save(function (err) {
          if (err) console.log(err);
        });
        console.log("a user successfully created");
        return cb(null, newUser);
      }

    })
  }
));