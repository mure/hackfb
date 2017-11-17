var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var path = require('path');


app.use(express.static(__dirname + '/node_modules'));  

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

app.get('/join', function(req, res,next) {  
    res.sendFile(__dirname + '/views/Join.html');
});


app.get('/create', function(req, res,next) {  
    res.sendFile(__dirname + '/views/Create.html');
});



var startTime;
var videoId;

io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  
    socket.on('init', function() { 
        var response = {
          id: videoId,
          startTime: startTime,
        };
      
        socket.emit('video', response);
    });
  
    socket.on('video', function(id) {
      videoId = id;
      
      var response = {
        id: id,
        startTime: startTime,
      };
      
      io.sockets.emit('video', response);
    });
  
    socket.on('sync', function() {
      socket.emit('sync', Date.now());
    });
  
    socket.on('start',
      function(data) {
        startTime = Date.now() + 400;
        io.sockets.emit('start', startTime);
      }
    );
  
    socket.on('join',
      function(data) {
        socket.emit('join', startTime);
      }
    );
  
    socket.on('print', function(data) {
      console.log(data);
    });
  }
);


server.listen(3000);  