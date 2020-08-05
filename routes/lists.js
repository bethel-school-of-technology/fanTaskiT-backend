var express = require('express');
var router = express.Router();
var models = require('../models');
var mysql = require('mysql2');

var Sequelize = require('sequelize');
const authService = require('../services/auth');
var op = Sequelize.Op;

/* GET ALL - MAYBE THIS SHOULD GO UNDER USERS.JS ? parameterized route */
router.get('/', function (req, res, next) {
    let token = req.cookies.jwt;
    if (token) {
    authService.verifyUser(token)
        .then(user => {
            if (user) {
                models.lists.findAll({
                    include: [{ 
                        model: models.user_lists 
                    }], 
                    where: {
                        user_id: user.user_id
                    }
                }).then(listsFound => {
                    res.setHeader('Content-Type', 'application/json');
                    return res.send(JSON.stringify(listsFound));
                });
            } else {
                res.status(401);
                return res.json({
                message: 'Sorry, invalid request.  Please try again.'
                });
            }
        });
    }
});


/* GET ONE*/
router.get('/:id', function (req, res, next) {
    models.lists.findByPk(parseInt(req.params.id))
      .then(list => {
        return res.send(JSON.stringify(list)); 
    })
});



/* CREATE */
router.post('/', function (req, res, next) {
    models.lists.create(req.body).then(newList => {
        res.setHeader('Content-Type', 'application/json'); 
        res.send(JSON.stringify(newList)); 
        })
        .catch(err => {
            res.status(400); 
            res.send(err.message); 
        })
    }); 



/*DELETE*/
router.delete('/', function (req, res, next) {
    let listId = parseInt(req.body.list_id);
  
    models.lists
      .destroy({
        where: {
            list_id: listId
          }}
      )
      .then(result => console.log('List deleted'))
      .catch(err => {
        res.status(400);
        res.send('There was something wrong with deleteing the task.');
      })
  });


module.exports = router;