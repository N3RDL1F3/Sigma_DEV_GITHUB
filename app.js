var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

//Custom SDM Vars for testing purposes
var SDM_BB = require('./routes/billboard');
var SDM_SKY = require('./routes/sky');
var SDM_LEADER = require('./routes/leader');
var SDM_WALL = require('./routes/walli');
var SDM_ALL = require('./routes/all');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log("[DEBUG] Sigma: " + __dirname);
app.use(express.static(path.join(__dirname, 'MetaTag_TEST')));

app.use('/', routes);
app.use('/users', users);

//add new URL's to the app
app.use('/SDM_BB',SDM_BB);
app.use('/SDM_SKY',SDM_SKY);
app.use('/SDM_LEADER',SDM_LEADER);
app.use('/SDM_WALL',SDM_WALL);
app.use('/SDM_ALL',SDM_ALL);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log("Sigma Exported!")
module.exports = app;
