var express = require('express');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res, next) {
  console.log("[DEBUG] Sigma: Sending File -> Home");
  res.render('index', { title: 'SDM Aaron TestServer' });
});

module.exports = router;
