var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('SDM_billboardTest', { title: 'SDM_BB_Test' });
});

module.exports = router;
