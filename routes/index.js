var express = require('express');
var router = express.Router();

var models = require('../models');

/* GET home page. */
router.get('/', async (req, res, next) => {
  console.log(models)
  const locations = await models.Location.query();
  console.log(locations)
  res.render('index', { title: 'Express' });
});

module.exports = router;
