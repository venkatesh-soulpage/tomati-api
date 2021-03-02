var express = require('express');
var router = express.Router();

var models = require('../models');

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
