/**
 * Created by Adams on 29.08.2016.
 */
var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('rectangle', { title: 'SDM_Rectangle_Test' });
});

module.exports = router;