var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');

var routes = require('./routes/index');

// Random name generator
var Moniker = require('moniker');
var names = Moniker.generator([Moniker.adjective, Moniker.noun], {glue: '_'});

var socket_io = require('socket.io');
var Sync = require('./app/models/Sync');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/', routes);

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


// UTILS
var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '' + Math.random().toString(36).substr(2, 5);
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var io = socket_io();
app.io = io;

io.on('connection', function(socket) {
  // console.log('A client connected');

  // Save the id, generate the server code and send it to it
  var socketID = socket.id;
  var appTempID = ID();

  var client = new Sync({
    socket_identifier: ''+socketID,
    app_identifier: ''+appTempID,
    first_player_name: ''+names.choose().capitalize()
  });

  client.save(function (err) {
    if (err) throw err;
    // console.log("User Created");
    // Send the code of the client
    socket.emit('first_ready', {code: client.app_identifier, name: client.first_player_name} );
  });

  socket.on('match_code', function(data){
    // console.log(data);
    // Check in current status for code
    var code = data['code'];
    var opponent_name = data['name'];
    Sync.find({app_identifier: code}, function (err, clients){
      if (err) throw err;

      if (clients.length > 0) {
        var client = clients[0];

        console.log(client);
        client.other_socket = socket.id;
        client.second_player_name = opponent_name;

        // There's only 5 hands
        var arr = [0,1,2,3,4];
        var left_index = arr[Math.floor(Math.random()*arr.length)];
        var right_index = arr[Math.floor(Math.random()*arr.length)];

        // Emit to clients
        io.to(client.socket_identifier)
            .emit('complete', {index: left_index, opponent: right_index, opponent_name: client.second_player_name});
        io.to(client.other_socket)
            .emit('complete', {index: right_index, opponent: left_index, opponent_name: client.first_player_name});

        client.connection_date = new Date();
        client.save(function (err) {
          if (err) throw err;
        });
      }
    });
  });
});





module.exports = app;
