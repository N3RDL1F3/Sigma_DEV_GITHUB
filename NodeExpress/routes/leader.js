/**
 * Created by Adams on 24.08.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("[DEBUG] Sigma: Sending File -> Leader");
    res.render('SDM_leaderTest', { title: 'SDM_Leader_Test' });
});

module.exports = router;
