require('metaTag');

var express = require('express');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res, next) {
  console.log("[DEBUG] Sigma: Sending File -> Home");
  res.render('index', { title: 'SDM Aaron TestServer' });
});

/*
router.get('/SDM_LEADER', function (req, res,html) {
  console.log('Sigma: Sending File!')
  res.sendFile(path.join(__dirname+'/SDM_leaderTest.ejs'));
});*/

module.exports = router;

setup = function(){

}
