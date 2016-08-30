var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('SDM_skyTest', { title: 'SDM_Sky_Test' });
});

module.exports = router;
