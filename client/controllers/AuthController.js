const User = require('../models/User');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const { response } = require('express');



class AuthController {
    // [GET] /auth/failed
    authFailed(req, res)  {
        res.send('You Failed to log in!');
    }
    // [GET] /auth/success
    authSuccess(req, res) {
        res.send(req.user); 
    }
    // [GET] /register
    register(req, res) {
        const newUser = req.body;
        const hash = bcrypt.hashSync(newUser.password, 12);
        User.findOne({ email: newUser.email }, function(err, user) {
          if(err) next(err);
          else if(user) {
            res.redirect('/auth/failed');
          }
          else {
            user = new User({ userName: newUser['user-name'], email: newUser.email, phoneNumber: `+${newUser['calling-code']}-${newUser['phone-number']}`, password: hash });
            user.save(function(err, doc){
              if(err) {
                res.redirect('/auth/failed');}
              else {
                res.redirect('/login');
              }
            })
          }
        })
      }
    // [GET] /login
    getLogin(req, res) {
        res.render('pug', { showLogin: true })
    }
    // [POST] /login
    postLogin(req, res) {
        if(req.body.remember){
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
        } else {
          req.session.cookie.expires = false;
        }
        res.redirect('/laptop-ldp');
    }
    // [GET] /auth/google/callback
    getGoogle(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/laptop-ldp');
    }
    // [GET] /auth/facebook/callback
    getFacebook(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/laptop-ldp');
    }
    // [GET] /logout
    logout(req, res) {
        req.session.destroy();
        req.logout();
        res.redirect("/");
      }
     // [POST] /auth/check
    checkEmail(req, res) {
        const { userName, email } = req.body;
        User.findOne({ email }, function(err, user){
          if(err)console.log(err);
          if(user)res.send({ error: "* Dupplicate user. Maybe you want to <a style='color: blue' href='/login'>login</a>" });
          else res.send({ passed: true });
        })
      }
}


module.exports = new AuthController();