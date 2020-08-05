var express = require('express');
var router = express.Router();
var models = require('../models');
var mysql = require('mysql2');
var authService = require('../services/auth');
var passport = require('../services/passport');

var Sequelize = require('sequelize');
var op = Sequelize.Op;

/*CREATE USER*/
router.post('/signup', function (req, res, next) {
  models.users
    .findOrCreate({
      where: {
        username: req.body.username
      },
      defaults: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: authService.hashPassword(req.body.password)
      }
    })
    .spread(function (result, created) {
      if (created) {
        res.redirect('/login');
        console.log('User successfully created.')
      } else {
        res.status(400);
        console.log('Failed. User already exists');;
      }
    });
});


/*LOG IN USER*/

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/'
  }),
  function (req, res, next) {
    models.users
      .findOne({
        where: {
          email: req.body.user.email
        }
      }).then(user => {
        if (!user) {
          console.log('User not found.');
          return res.status(401).json({
            message: 'Login failed.'
          });
        } else {
          let passwordMatch = authService.comparePasswords(req.body.user.password, user.password);
          if (passwordMatch) {
            let token = authService.signUser(user);
            res.cookie('jwt', token);
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/task');
          } else {
            res.cookie('jwt', "", {
              expires: new Date(0)
            });
            console.log('Wrong password');
            res.send('Incorrect username/password');
          }
        }
      })
  });



/*VIEW USER PROFILE*/
router.get('/:id', function (req, res, next) {
  let UserId = parseInt(req.params.id);
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.users.findOne({
            where: {
              user_id: UserId
            }
          })
          return res.send(JSON.stringify(user));
        } else {
          res.status(401);
          return res.json({
            message: 'Sorry, invalid username/password.  Please try again.'
          });
        }
      });
  } else {
    res.status(401);
    return res.json({
      message: 'Login failed.  Please try again.'
    });
  }
});


/*LOG OUT USER*/
router.get('/logout', function (req, res, next) {
  res.cookie('jwt', "", {
    expires: newDate(0)
  });
  res.redirect('http//localhost:3000/users/login');
});


module.exports = router;