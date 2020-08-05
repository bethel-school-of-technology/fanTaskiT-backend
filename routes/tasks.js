var express = require('express');
var router = express.Router();
var models = require('../models');
var mysql = require('mysql2'); 

var Sequelize = require('sequelize');
var op = Sequelize.Op;

  /* GET ALL */
  router.get('/', function(req, res, next) {
    models.tasks
      .findAll({ 
        attributes: ['task, task_id'],
        include: [{ 
          model: models.list_tasks, 
          attributes: ['list_id', 'task_id'] 
        }]      
      })
      .then(tasksFound => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(tasksFound));
      });
  });

  /* GET ONE */
  router.get('/:id', function(req, res, next) {
    models.tasks
      .findOne({ 
        include: [{ model: models.list_tasks }], 
        where: { task_id: parseInt(req.params.id) }
      })
      .then(tasksFound => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(tasksFound));
      })
  });


/* CREATE */ 
router.post('/', function (req, res, next) {
    models.lists.create(req.body).then(newTask => 
      {
        res.setHeader('Content-Type', 'application/json'); 
        res.send(JSON.stringify(newTask)); 
      })
        .catch(err => {
            res.status(400); 
            res.send(err.message); 
        })
    }); 

/*DELETE*/
router.delete('/', function (req, res, next) {
  let listId = parseInt(req.body.list_id);
  let taskId = parseInt(req.body.task_id);

  models.lists
    .destroy({
      where: {
        [op.and]: {
          list_id: listId,
          task_id: taskId
        }
      }
    })
    .then(result => console.log('Task deleted.'))
    .catch(err => {
      res.status(400);
      res.send('There was something wrong with deleteing the task.');
    })
});


module.exports = router;
