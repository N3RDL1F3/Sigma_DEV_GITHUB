/**
 * Created by Adams on 24.08.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('SDM_wallTest', { title: 'SDM_Wall_Test' });
});

module.exports = router;
