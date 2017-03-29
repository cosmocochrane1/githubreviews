'use strict'

const _ = require('lodash');

require('./config/config');

// index.js
const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
const app = express();
const bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

// ---- //

//DB
const { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
const {User} = require('./model/User');
// ---- //

//VIEWS SETUP
app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))  

app.use(bodyParser.json());
// ---- //

app.use((request, response, next) => {  
  request.chance = Math.random();
  next();
});
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    clientID: "651430805036600",
    clientSecret: "f8e51ccfa40f956da8f26c9102fe9b35",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'] //This
  },
  function(accessToken, refreshToken, profile, cb) {
    //take email;
    //create user
      var params = profile._json;
      var params = _.pick(params, ['email', 'id']);
      params.password = params.id;

      //find user by email and their password which we have used as ID 
      User.findByCredentials(params.email, params.password).then((user) => {
        cb(null, user);
        //     console.log('FACEBOOK OK ****', whatever)  
        //   }).catch((err) => {
        //   console.log('FACEBOOK ERROR ****', err)
        //   return Promise.resolve();
        // });
        //if no user is found we are going to create one for them and then 
        //call facebooks callback
        //if user is found we are going to directly return the user we found
      }).catch((err) => {
          console.log(err);
          console.log("inside the catch")
          var user = new User(params);
          user.save().then(() => {
            console.log('GENERATING TOKEN')
            return user.generateAuthToken();
          }).then((err, user) => {
            console.log('INSIDE THIS CALLBACK')
            return cb(err, user);
          });   
      })
      //if the user does not exist create the user
      
  }
));

app.get('/auth/facebook', passport.authorize('facebook', { scope : ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: "NOPE!" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.post('/users', function (req, res) {  
  //grab email from the body of the request 
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
  //save that email into DB- when success send the user back. 
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      var responseObject = {
        email: user.email,
        token: token
      }

      res.status(200).send(responseObject)
    }).catch((err) => {
      res.status(404).send(err)
    })
});

app.get('/users', function (req, res, next) {  
 
});

app.get('/', (request, response) => {  
  response.render('home', {
    name: 'John'
  })
})



app.listen(3000) 
