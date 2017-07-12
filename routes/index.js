var express = require('express');
var router = express.Router();
var helper = require('../public/javascripts/Helper');

/* GET home page. */

router.get('/', function(req, res, next) {
  console.log("[DEBUG] Sigma: Sending File -> Home");

  res.render('index', { title: 'SDM Sigma','help':helper.prototype});
});

module.exports = router;

/*
this.prototype.btnClick = function()
{
  console.log('click');
}*/
